"""T5 and rule loading."""
import pytest

from ghatwatch.rules import canonical_parameter, load_rules, parse_limit, severity


def test_rules_class_b(rules):
    assert (rules["Dissolved oxygen"].min, rules["BOD"].max) == (5, 3)
    assert (rules["pH"].min, rules["pH"].max) == (6.5, 8.5)


def test_rules_class_c(rules_c):
    assert rules_c["Dissolved oxygen"].min == 4 and (rules_c["pH"].min, rules_c["pH"].max) == (6, 9)


def test_mismatch_raises(tmp_path, cfg):
    p = tmp_path / "c.csv"
    p.write_text("class,parameter,criteria\nB,Dissolved oxygen,6 mg/l or more\nB,BOD,3 mg/l or less\n"
                 "B,pH,6.5 to 8.5\n", encoding="utf-8")
    with pytest.raises(ValueError, match="do not guess"):
        load_rules(str(p), "B", cfg)


def test_wide_layout(tmp_path, cfg):
    p = tmp_path / "w.csv"
    p.write_text("Criteria,A,B,C\nDissolved Oxygen (DO),6 mg/l or more,5 mg/l or more,4 mg/l or more\n"
                 "BOD 5 days 20C,2 mg/l or less,3 mg/l or less,3 mg/l or less\npH,6.5-8.5,6.5-8.5,6-9\n",
                 encoding="utf-8")
    assert load_rules(str(p), "C", cfg)["pH"].max == 9


def test_t5_boundaries(rules):
    assert severity("Dissolved oxygen", 5.0, rules) == 0
    assert severity("BOD", 3.0, rules) == 0
    assert severity("pH", 6.5, rules) == 0 and severity("pH", 8.5, rules) == 0
    assert severity("Dissolved oxygen", 4.99, rules) > 0 and severity("BOD", 3.01, rules) > 0


def test_severity_formula(rules):
    assert severity("Dissolved oxygen", 0.0, rules) == 1.0
    assert severity("Dissolved oxygen", 2.5, rules) == pytest.approx(0.5)
    assert severity("BOD", 7.5, rules) == pytest.approx(0.5)
    assert severity("BOD", 40, rules) == 1.0
    assert severity("pH", 9.0, rules) == pytest.approx(0.5)
    assert severity("pH", 5.0, rules) == 1.0


def test_aliases_and_parse():
    assert canonical_parameter("Phosphate") is None
    assert canonical_parameter("DO") == "Dissolved oxygen"
    assert parse_limit("not exceeding 3 mg/l") == (None, 3)
    with pytest.raises(ValueError):
        parse_limit("see note")
