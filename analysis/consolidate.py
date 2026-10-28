"""Consolidate AI-readiness answers: course record -> department -> school -> country.

Usage:
    python analysis/consolidate.py data/responses.csv            # real data
    python analysis/consolidate.py analysis/synthetic_responses.csv

Inputs
    responses.csv   one row per access code (department/course), one column per item
    docs/codebook.csv   column metadata (type, domain, value codes)

Outputs (analysis/output/)
    course_scores.csv       one row per submitted form, with domain scores
    department_scores.csv   mean of course scores within a department (n_courses)
    school_scores.csv       department scores weighted by number of courses contributed
    country_scores.csv      mean of school scores per country
    curriculum_courses.csv  transparency list: which named courses produced the curriculum score
    ai_hours_by_topic.csv   AI hours per year by topic, by country

Scoring (PAHO/WHO AI Readiness Toolkit, Section 2 "Analysis of the results")
    * 1-4 maturity items: "Don't know / N/A" (-1) is treated as missing.
    * Domain score = mean of the domain's 1-4 items; index 0-100 = (mean - 1) / 3 * 100.
    * AI-GUARD index (G11) and generative-AI safeguards index (F06): Yes=2, Partial=1, No=0,
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
    "CUR": "Curriculum",
    "GEN": "Generative AI",
    "GOV": "Governance & ethics",
    "IMP": "Implementation & sustainability",
}
KEYS = ["A01", "A03", "A06"]  # country, institution, department


def load(path):
    codebook = pd.read_csv(ROOT / "docs" / "codebook.csv", dtype=str).fillna("")
    df = pd.read_csv(path, dtype=str).fillna("")
    df = df[df["status"] == "submitted"].copy()
    is_numeric = codebook["type"].isin(["scale", "grid", "number", "single", "binary"])
    numeric = codebook.loc[is_numeric & (codebook["section"] != "A"), "name"]  # Part A stays text (country codes)
    for col in numeric:
        if col in df:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df, codebook


def to_index(mean_1_to_4):
    return (mean_1_to_4 - 1) / 3 * 100


def course_scores(df, codebook):
    scale = codebook[codebook["type"] == "scale"]
    out = df[["code", *KEYS, "A07", "A08"]].copy()
    for dom in DOMAINS:
        items = [c for c in scale.loc[scale["domain"] == dom, "name"] if c in df]
        vals = df[items].where(df[items] >= 1)  # -1 (don't know) -> NaN
        out[f"{dom}_mean"] = vals.mean(axis=1)
        out[f"{dom}_index"] = to_index(out[f"{dom}_mean"])
        out[f"{dom}_items_answered"] = vals.notna().sum(axis=1)
    idx_cols = [f"{d}_index" for d in DOMAINS]
    out["overall_index"] = out[idx_cols].mean(axis=1)

    for qid, label in [("G11", "aiguard_index"), ("F06", "genai_safeguards_index")]:
        cols = [c for c in df if c.startswith(qid + "_")]
        vals = df[cols].where(df[cols] >= 0)
        out[label] = vals.sum(axis=1) / (2 * vals.notna().sum(axis=1)) * 100

    terms = df["B05"].fillna(2).replace(0, 2)
    out["ai_hours_per_year"] = df[[c for c in df if c.startswith("E02_")]].sum(axis=1, min_count=1) * terms
    out["programming_hours_per_year"] = df["E09"] * terms
    out["self_rated_maturity"] = df["I01"].where(df["I01"] >= 1)
    return out


def rollups(courses):
    score_cols = [c for c in courses if c.endswith("_index")] + [
        "ai_hours_per_year", "programming_hours_per_year", "self_rated_maturity"]

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

    school = dept.groupby(["A01", "A03"]).apply(weighted, include_groups=False).reset_index()
    country = school.groupby("A01")[score_cols].mean()
    country.insert(0, "n_schools", school.groupby("A01").size())
    return dept, school, country.reset_index()


def hours_by_topic(df):
    terms = df["B05"].fillna(2).replace(0, 2)
    cols = [c for c in df if c.startswith("E03_")]
    hours = df[cols].multiply(terms, axis=0)
    hours.columns = [c.removeprefix("E03_") for c in cols]
    hours["country"] = df["A01"]
    return hours.groupby("country").agg(["mean", "median"]).round(1)


def main(path):
    df, codebook = load(path)
    if df.empty:
        sys.exit("No submitted forms in " + str(path))
    OUT.mkdir(parents=True, exist_ok=True)
    courses = course_scores(df, codebook)
    dept, school, country = rollups(courses)
    courses.to_csv(OUT / "course_scores.csv", index=False)
    dept.to_csv(OUT / "department_scores.csv", index=False)
    school.to_csv(OUT / "school_scores.csv", index=False)
    country.to_csv(OUT / "country_scores.csv", index=False)
    courses[["A01", "A03", "A06", "A07", "CUR_index"]].sort_values(["A01", "A03", "A06"]).to_csv(
        OUT / "curriculum_courses.csv", index=False)
    hours_by_topic(df).to_csv(OUT / "ai_hours_by_topic.csv")

    pd.set_option("display.width", 160)
    print(f"{len(df)} submitted forms · {len(dept)} departments · {len(school)} schools\n")
    print(country.round(1).to_string(index=False))
    print(f"\nFiles written to {OUT}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ROOT / "data" / "responses.csv")
