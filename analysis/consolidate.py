"""Consolidate the ICARB-D annual survey: rank dental schools by maturity and compare states and countries, per survey year.

Forms describe a whole school (A17 = 1), a department (2) or a course (3).
Course and department forms -> department -> school (weighted by courses); a school-wide form is combined
with that picture to give the school score used for the ranking; schools -> state -> country.

Usage:
    python analysis/consolidate.py data/responses.csv            # real data
    python analysis/consolidate.py analysis/synthetic_responses.csv

Inputs
    responses.csv       one row per access code (department/course and survey year), one column per item
    docs/codebook.csv   column metadata (type, domain, value codes)

Outputs (analysis/output/)
    course_scores.csv       one row per submitted form, with domain indices, hours and equipment counts
    department_scores.csv   mean of course scores within a department and year (n_courses)
    school_scores.csv       school ranking: combined score per school and year, rank overall and within country
    state_scores.csv        mean of school scores per country, state and year
    country_scores.csv      mean of school scores per country and year (US first)
    school_trends.csv       overall index of each school in each survey year
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
WAVE, STATE, SCHOOL, DEPT, UNIT = "A15", "A02", "A03", "A06", "A17"
COUNTRY = "country"
SCHOOL_KEYS = [WAVE, COUNTRY, STATE, SCHOOL]
KEYS = [*SCHOOL_KEYS, DEPT]
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
    df = df.copy()  # de-fragment after the column-by-column conversion
    other = df["A01_other"] if "A01_other" in df else ""
    country = df["A01"].where(df["A01"] != "99", other)
    df[COUNTRY] = country.where(country != "", "Other")
    df[UNIT] = df[UNIT].where(df[UNIT] != "", "3") if UNIT in df else "3"  # older forms: course level
    return df, codebook


def to_index(mean_1_to_4):
    return (mean_1_to_4 - 1) / 3 * 100


def prefixed(df, prefix):
    return [c for c in df if c.startswith(prefix)]


def course_scores(df, codebook):
    scale = codebook[codebook["type"] == "scale"]
    out = df[["code", *KEYS, UNIT, "A07", "A08"]].copy()
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


def rollups(forms):
    score_cols = [c for c in forms if c.endswith("_index") or c.endswith("_per_year")
                  or c in ("digital_equipment_units", *SELF_RATED.values())]
    detail = forms[forms[UNIT] != "1"]
    school_wide = forms[forms[UNIT] == "1"]

    # Department = mean of its course and department forms.
    dept = detail.groupby(KEYS)[score_cols].mean()
    dept.insert(0, "n_forms", detail.groupby(KEYS).size())
    dept = dept.reset_index()

    # School from departments = departments weighted by the number of forms each contributed.
    def weighted(g):
        w = g["n_forms"]
        row = {c: np.average(g[c].dropna(), weights=w[g[c].notna()]) if g[c].notna().any() else np.nan for c in score_cols}
        row["n_departments"] = len(g)
        row["n_detail_forms"] = int(w.sum())
        return pd.Series(row)

    from_depts = dept.groupby(SCHOOL_KEYS).apply(weighted, include_groups=False) if len(dept) else pd.DataFrame()
    wide = school_wide.groupby(SCHOOL_KEYS)[score_cols].mean()
    wide["n_school_wide_forms"] = school_wide.groupby(SCHOOL_KEYS).size()

    # School score = mean of the school-wide form and the department picture, whichever exist.
    idx = from_depts.index.union(wide.index)
    a = from_depts.reindex(idx)
    b = wide.reindex(idx)
    school = pd.concat([a[score_cols], b[score_cols]]).groupby(level=list(range(len(SCHOOL_KEYS)))).mean()
    school["overall_index_departments"] = a["overall_index"]
    school["overall_index_school_wide"] = b["overall_index"]
    school["n_departments"] = a["n_departments"].fillna(0).astype(int)
    school["n_detail_forms"] = a["n_detail_forms"].fillna(0).astype(int)
    school["n_school_wide_forms"] = b["n_school_wide_forms"].fillna(0).astype(int)
    school = school.reset_index()
    school["rank_overall"] = school.groupby(WAVE)["overall_index"].rank(ascending=False, method="min").astype("Int64")
    school["rank_in_country"] = school.groupby([WAVE, COUNTRY])["overall_index"].rank(ascending=False, method="min").astype("Int64")
    lead = [*SCHOOL_KEYS, "rank_overall", "rank_in_country", "overall_index", "overall_index_school_wide",
            "overall_index_departments", "n_school_wide_forms", "n_departments", "n_detail_forms"]
    school = school[lead + [c for c in score_cols if c != "overall_index"]].sort_values([WAVE, "rank_overall"])

    state = school.groupby([WAVE, COUNTRY, STATE])[score_cols].mean()
    state.insert(0, "n_schools", school.groupby([WAVE, COUNTRY, STATE]).size())
    country = school.groupby([WAVE, COUNTRY])[score_cols].mean()
    country.insert(0, "n_schools", school.groupby([WAVE, COUNTRY]).size())
    country = country.reset_index()
    country["_us"] = country[COUNTRY] != "US"
    country = country.sort_values([WAVE, "_us", "overall_index"], ascending=[True, True, False]).drop(columns="_us")

    trends = dept.pivot_table(index=[COUNTRY, STATE, SCHOOL, DEPT], columns=WAVE, values="overall_index")
    trends.columns = [f"overall_{w}" for w in trends.columns]
    school_trends = school.pivot_table(index=[COUNTRY, STATE, SCHOOL], columns=WAVE, values="overall_index")
    school_trends.columns = [f"overall_{w}" for w in school_trends.columns]
    return dept, school, state.reset_index(), country, trends.reset_index(), school_trends.reset_index()


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
    dept, school, state, country, trends, school_trends = rollups(courses)
    courses.to_csv(OUT / "course_scores.csv", index=False)
    dept.to_csv(OUT / "department_scores.csv", index=False)
    school.to_csv(OUT / "school_scores.csv", index=False)
    state.to_csv(OUT / "state_scores.csv", index=False)
    country.to_csv(OUT / "country_scores.csv", index=False)
    school_trends.to_csv(OUT / "school_trends.csv", index=False)
    trends.to_csv(OUT / "department_trends.csv", index=False)
    courses[[WAVE, COUNTRY, STATE, SCHOOL, UNIT, DEPT, "A07", "CUR_index"]].sort_values([WAVE, COUNTRY, STATE, SCHOOL, DEPT]).to_csv(
        OUT / "curriculum_courses.csv", index=False)
    hours_by_topic(df).to_csv(OUT / "hours_by_topic.csv")

    pd.set_option("display.width", 200)
    print(f"{len(df)} submitted forms · {len(dept)} department-years · {school[SCHOOL].nunique()} schools · "
          f"waves {sorted(df[WAVE].dropna().unique().tolist())}\n")
    latest = school[WAVE].max()
    top = school[(school[WAVE] == latest) & (school[COUNTRY] == "US")].head(10)
    print(f"Most prepared US dental schools, {latest} (overall maturity index 0-100):")
    print(top[["rank_in_country", SCHOOL, STATE, "overall_index", "n_school_wide_forms", "n_detail_forms"]].round(1).to_string(index=False))
    print()
    show = [WAVE, COUNTRY, "n_schools", "overall_index", "INF_index", "HUM_index", "CUR_index",
            "HIN_index", "ROB_index", "BIO_index", "ai_hours_per_year"]
    print(country[show].round(1).to_string(index=False))
    print(f"\nFiles written to {OUT}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ROOT / "data" / "responses.csv")
