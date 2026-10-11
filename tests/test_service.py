"""Robustness, hindcast, service facade, performance (on a synthetic repo root)."""
import shutil
import time

import pytest

from conftest import ROOT, synthetic_raw
from ghatwatch import service
from ghatwatch.hindcast import average_ranks, spearman


@pytest.fixture
def ctx(tmp_path, cpcb_csv):
    (tmp_path / "data").mkdir()
    synthetic_raw().to_csv(tmp_path / "data" / "bhopal_ghats_2023_2025.csv", index=False)
    shutil.copy(cpcb_csv, tmp_path / "data" / "cpcb_water_quality_criteria.csv")
    shutil.copy(ROOT / "config.yaml", tmp_path / "config.yaml")
    return service.load_context(tmp_path)


def test_robustness(ctx):
    r = service.get_robustness(ctx)
    assert set(r.columns) == {"site", "rank_min", "rank_max", "top3_count", "n"}
    assert (r["n"] == 16).all() and (r["rank_min"] <= r["rank_max"]).all()


def test_spearman():
    assert list(average_ranks([3, 1, 1])) == [3.0, 1.5, 1.5]
    assert spearman([1, 2, 3], [10, 20, 30]) == pytest.approx(1.0)
    assert spearman([1, 2, 3], [3, 2, 1]) == pytest.approx(-1.0)
    assert spearman([1, 1, 1], [1, 2, 3]) is None


def test_hindcast_small_sample(ctx):
    h = service.get_hindcast(ctx)
    assert h["caveat"] and h["test_year"] == 2025
    assert h["n_ghats"] == 2 and h["spearman"] is None and "only 2" in h["reason"]


def test_service_functions(ctx):
    rk = service.get_ranking(ctx, festival="Ganesh", years=[2025])
    assert list(rk["rank"]) == [1, 2, 3]
    d = service.get_ghat_detail(ctx, "Ghat A")
    assert {"readings", "limits", "diagnosis", "metals", "evidence"} <= set(d)
    assert all("url" in e for e in d["evidence"])
    assert len(service.get_coverage(ctx)) == 3 * 2 * 3 * 3 * 3  # cfg years 2023-25
    assert not service.get_checklist(ctx).empty
    assert service.get_limits_panel(ctx)
    assert service.get_method(ctx)["weights"]["S"] == 0.45
    b = service.get_brief(ctx, "hi", use_ai=False)
    assert b["guard"].ok and b["status_badge"] == "AI off, standard text"
    with pytest.raises(KeyError):
        service.get_ghat_detail(ctx, "Nowhere")


def test_ai_brief_without_key(ctx, monkeypatch):
    monkeypatch.delenv("CEREBRAS_API_KEY", raising=False)
    b = service.get_brief(ctx, "en", use_ai=True)
    assert b["meta"]["source"] == "template" and b["guard"].ok


def test_performance(tmp_path, cpcb_csv):
    (tmp_path / "data").mkdir()
    raw = synthetic_raw()
    big = __import__("pandas").concat([raw.assign(site=raw["site"] + f" {i}") for i in range(3)], ignore_index=True)
    big.to_csv(tmp_path / "data" / "bhopal_ghats_2023_2025.csv", index=False)
    shutil.copy(cpcb_csv, tmp_path / "data" / "cpcb_water_quality_criteria.csv")
    shutil.copy(ROOT / "config.yaml", tmp_path / "config.yaml")
    t = time.perf_counter()
    c = service.load_context(tmp_path)
    service.get_ranking(c), service.get_robustness(c), service.get_hindcast(c), service.get_facts(c)
    assert time.perf_counter() - t < 2.0
