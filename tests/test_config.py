"""Config loads and validates."""
import pytest
import yaml

from ghatwatch.config import load_config


def test_config_loads():
    cfg = load_config()
    assert cfg["weights"] == {"S": 0.45, "P": 0.35, "E": 0.20}
    assert cfg["recency"][2023] == 0.5
    assert set(cfg["report_urls"]) == {2023, 2024, 2025}


def test_bad_weights_raise(tmp_path):
    cfg = yaml.safe_load(open("config.yaml", encoding="utf-8"))
    cfg["weights"]["S"] = 0.9
    p = tmp_path / "c.yaml"
    p.write_text(yaml.safe_dump(cfg, allow_unicode=True), encoding="utf-8")
    with pytest.raises(ValueError):
        load_config(p)
