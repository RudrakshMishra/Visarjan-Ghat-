"""Coverage grid, TABLE_ABSENT slots, checklist, T8 evidence."""
from conftest import REAL_CSV, needs_real
from ghatwatch.coverage import coverage_matrix
from ghatwatch.coverage import testing_checklist as checklist
from ghatwatch.evidence import evidence_for
from ghatwatch.loader import load_readings
from ghatwatch.scoring import score_ghats


def test_grid_and_absent(syn):
    cov = coverage_matrix(syn)
    assert len(cov) == 3 * 2 * 2 * 3 * 3  # sites x festivals x years x phases x params
    absent = cov[cov["status"] == "TABLE_ABSENT"][["site", "festival", "year"]].drop_duplicates()
    assert ("Ghat B", "Durga", 2025) in set(map(tuple, absent.values.tolist()))
    assert (cov[(cov["site"] == "Ghat C") & (cov["phase"] == "pre")]["status"] != "MEASURED").all()


def test_filtered_df_coverage(syn, rules, cfg):
    only = syn[syn["festival"] == "Ganesh"]
    c = score_ghats(only, rules, cfg).set_index("site")
    assert c.loc["Ghat A", "coverage"] == 1.0


def test_checklist(syn, rules, cfg):
    ck = checklist(syn, rules, cfg)
    c = ck[(ck["site"] == "Ghat C") & (ck["phase"] == "pre")]
    assert len(c) == 3 and c.iloc[0]["suggested_date"] == "before 2026-10-20"
    assert (ck[ck["phase"] == "after"]["suggested_date"] == "2026-10-27").all()


def test_t8_evidence(syn, cfg):
    ev = evidence_for(syn.iloc[0], cfg)
    assert ev["url"].endswith("#page=10") and ev["page"] == 10 and "2024.pdf" in ev["url"]
    row = dict(syn.iloc[0]); row["source_page"] = None
    ev2 = evidence_for(row, cfg)
    assert "#page" not in ev2["url"] and "page_note" in ev2


@needs_real
def test_real_absent_durga_2025():
    cov = coverage_matrix(load_readings(str(REAL_CSV)))
    absent = cov[(cov["status"] == "TABLE_ABSENT") & (cov["festival"] == "Durga") & (cov["year"] == 2025)]
    names = " ".join(absent["site"].unique()).lower()
    assert "bairagarh" in names and "malikhedi" in names


@needs_real
def test_t8_real_pages():
    df = load_readings(str(REAL_CSV))
    assert df.loc[df["status"] == "MEASURED", "source_page"].notna().all()
