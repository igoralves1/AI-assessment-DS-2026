"""Consolidate the ICARB-D annual survey: course record -> department -> school -> country, per survey year.

Usage:
    python analysis/consolidate.py data/responses.csv            # real data
    python analysis/consolidate.py analysis/synthetic_responses.csv

Inputs
    responses.csv       one row per access code (department/course and survey year), one column per item
    docs/codebook.csv   column metadata (type, domain, value codes)

Outputs (analysis/output/)
    course_scores.csv       one row per submitted form, with domain indices, hours and equipment counts
    department_scores.csv   mean of course scores within a department and year (n_courses)
    school_scores.csv       department scores weighted by number of courses contributed
    country_scores.csv      mean of school scores per country and year
    department_trends.csv   overall index of each department in each survey year (annual follow-up)
    curriculum_courses.csv  transparency list: which named courses produced the curriculum score
    hours_by_topic.csv      hours per year by topic (AI, health informatics, robotics, bioinformatics)

Scoring (PAHO/WHO AI Readiness Toolkit, Section 2 "Analysis of the results")
    * 1-4 maturity items: "Don't know / N/A" (-1) is treated as missing.
    * Domain index = (mean of the domain's 1-4 items - 1) / 3 * 100.
    * AI-GUARD index (J11) and generative-AI safeguards index (F06): Yes=2, Partial=1, No=0,
      as % of the maximum over answered rows.
    * Hours per year = hours per term x terms per year (B05; 2 if missing).
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "analysis" / "output"
DOMAINS = {
    "INF": "Infrastructure",
    "DAT": "Data",
    "HUM": "Human resources",
    "CUR": "AI curriculum",
    "GEN": "Generative AI",
    "HIN": "Health informatics",
    "ROB": "Robotics & digital dentistry",
    "BIO": "Bioinformatics",
    "GOV": "Governance & ethics",
    "IMP": "Implementation & sustainability",
}
WAVE, COUNTRY, SCHOOL, DEPT = "A15", "A01", "A03", "A06"
KEYS = [WAVE, COUNTRY, SCHOOL, DEPT]
HOURS = {"ai": "E02_", "health_informatics": "G09_", "robotics": "H05_", "bioinformatics": "I07_"}
SELF_RATED = {"M01": "self_ai", "M02": "self_health_informatics", "M03": "self_robotics", "M04": "self_bioinformatics"}


def load(path):
    codebook = pd.read_csv(ROOT / "docs" / "codebook.csv", dtype=str).fillna("")
    df = pd.read_csv(path, dtype=str).fillna("")
    df = df[df["status"] == "submitted"].copy()
    is_numeric = codebook["type"].isin(["scale", "grid", "number", "single", "binary"])
    numeric = codebook.loc[is_numeric & (codebook["section"] != "A"), "name"]  # Part A stays text (country codes)
    for col in numeric:
        if col in df:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    df[WAVE] = pd.to_numeric(df[WAVE], errors="coerce").astype("Int64")
    return df, codebook


def to_index(mean_1_to_4):
    return (mean_1_to_4 - 1) / 3 * 100


def prefixed(df, prefix):
    return [c for c in df if c.startswith(prefix)]


def course_scores(df, codebook):
    scale = codebook[codebook["type"] == "scale"]
    out = df[["code", *KEYS, "A07", "A08"]].copy()
    for dom in DOMAINS:
        items = [c for c in scale.loc[scale["domain"] == dom, "name"] if c in df]
        vals = df[items].where(df[items] >= 1)  # -1 (don't know) -> NaN
        out[f"{dom}_index"] = to_index(vals.mean(axis=1))
        out[f"{dom}_items_answered"] = vals.notna().sum(axis=1)
    out["overall_index"] = out[[f"{d}_index" for d in DOMAINS]].mean(axis=1)

    for qid, label in [("J11", "aiguard_index"), ("F06", "genai_safeguards_index")]:
        cols = prefixed(df, qid + "_")
        vals = df[cols].where(df[cols] >= 0)
        out[label] = vals.sum(axis=1) / (2 * vals.notna().sum(axis=1)) * 100

    terms = df["B05"].fillna(2).replace(0, 2)
    for name, prefix in HOURS.items():
        out[f"{name}_hours_per_year"] = df[prefixed(df, prefix)].sum(axis=1, min_count=1) * terms
    out["programming_hours_per_year"] = df["E09"] * terms
    out["digital_equipment_units"] = df[prefixed(df, "H01_")].sum(axis=1, min_count=1)
    out["students_per_equipment_unit"] = df["B01"] / out["digital_equipment_units"].replace(0, np.nan)
    for col, label in SELF_RATED.items():
        out[label] = df[col].where(df[col] >= 1)
    return out


def rollups(courses):
    score_cols = [c for c in courses if c.endswith("_index") or c.endswith("_per_year")
                  or c in ("digital_equipment_units", *SELF_RATED.values())]

    dept = courses.groupby(KEYS)[score_cols].mean()
    dept.insert(0, "n_courses", courses.groupby(KEYS).size())
    dept = dept.reset_index()

    # School = departments weighted by the number of named courses each contributed.
    def weighted(g):
        w = g["n_courses"]
        row = {c: np.average(g[c].dropna(), weights=w[g[c].notna()]) if g[c].notna().any() else np.nan for c in score_cols}
        row["n_departments"] = len(g)
        row["n_courses"] = int(w.sum())
        return pd.Series(row)

    school = dept.groupby([WAVE, COUNTRY, SCHOOL]).apply(weighted, include_groups=False).reset_index()
    country = school.groupby([WAVE, COUNTRY])[score_cols].mean()
    country.insert(0, "n_schools", school.groupby([WAVE, COUNTRY]).size())

    trends = dept.pivot_table(index=[COUNTRY, SCHOOL, DEPT], columns=WAVE, values="overall_index")
    trends.columns = [f"overall_{w}" for w in trends.columns]
    return dept, school, country.reset_index(), trends.reset_index()


def hours_by_topic(df):
    terms = df["B05"].fillna(2).replace(0, 2)
    cols = [c for p in ("E03_", "G09_", "H05_", "I07_") for c in prefixed(df, p)]
    hours = df[cols].multiply(terms, axis=0)
    hours[WAVE], hours[COUNTRY] = df[WAVE], df[COUNTRY]
    return hours.groupby([WAVE, COUNTRY]).median().round(1)


def main(path):
    df, codebook = load(path)
    if df.empty:
        sys.exit("No submitted forms in " + str(path))
    OUT.mkdir(parents=True, exist_ok=True)
    courses = course_scores(df, codebook)
    dept, school, country, trends = rollups(courses)
    courses.to_csv(OUT / "course_scores.csv", index=False)
    dept.to_csv(OUT / "department_scores.csv", index=False)
    school.to_csv(OUT / "school_scores.csv", index=False)
    country.to_csv(OUT / "country_scores.csv", index=False)
    trends.to_csv(OUT / "department_trends.csv", index=False)
    courses[[WAVE, COUNTRY, SCHOOL, DEPT, "A07", "CUR_index"]].sort_values([WAVE, COUNTRY, SCHOOL, DEPT]).to_csv(
        OUT / "curriculum_courses.csv", index=False)
    hours_by_topic(df).to_csv(OUT / "hours_by_topic.csv")

    pd.set_option("display.width", 200)
    print(f"{len(df)} submitted forms · {len(dept)} department-years · {school[SCHOOL].nunique()} schools · "
          f"waves {sorted(df[WAVE].dropna().unique().tolist())}\n")
    show = [WAVE, COUNTRY, "n_schools", "overall_index", "INF_index", "HUM_index", "CUR_index",
            "HIN_index", "ROB_index", "BIO_index", "ai_hours_per_year"]
    print(country[show].round(1).to_string(index=False))
    print(f"\nFiles written to {OUT}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ROOT / "data" / "responses.csv")
