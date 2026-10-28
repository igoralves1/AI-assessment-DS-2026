"""Create a fake responses.csv (random answers) to test the analysis pipeline before real data exists.

    python analysis/make_synthetic.py 120   -> analysis/synthetic_responses.csv
"""

import random
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
random.seed(2026)

codebook = pd.read_csv(ROOT / "docs" / "codebook.csv", dtype=str).fillna("")
codebook = codebook[codebook["pii"] != "true"]
countries = ["CA", "US", "BR", "CN", "IN"]
schools = {c: [f"{c} Dental School {i}" for i in range(1, 6)] for c in countries}
departments = ["Oral Radiology", "Prosthodontics", "Orthodontics", "Periodontics", "Restorative Dentistry"]


def value(row):
    codes = [v.split("=")[0] for v in row["values"].split(" | ") if "=" in v]
    t = row["type"]
    if t in ("scale", "single", "grid") and codes:
        return random.choice(codes)
    if t == "binary":
        return random.choice(["0", "0", "1"])
    if t == "number":
        return str(random.choice([0, 0, 1, 2, 4, 6, 10]))
    return ""


rows = []
n = int(sys.argv[1]) if len(sys.argv) > 1 else 120
for i in range(n):
    c = random.choice(countries)
    r = {"code": f"SYN-{i:03d}", "status": "submitted", "version": "synthetic"}
    for _, col in codebook.iterrows():
        if col["section"] and col["section"] != "A":
            r[col["name"]] = value(col)
    r.update(A01=c, A03=random.choice(schools[c]), A06=random.choice(departments),
             A07=f"COURSE-{i:03d}", A08="1", B05="1" if c == "IN" else "2",
             A15=random.choice(["2026", "2027"]))
    rows.append(r)

out = ROOT / "analysis" / "synthetic_responses.csv"
pd.DataFrame(rows).to_csv(out, index=False)
print(f"Wrote {n} synthetic forms to {out}")
