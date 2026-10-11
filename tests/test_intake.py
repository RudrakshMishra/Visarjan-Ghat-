"""T11 intake validation."""
import io

from ghatwatch.intake import apply_intake, validate_intake

HEAD = "year,festival,site,phase,parameter,value,source_page,source_note\n"


def test_t11_rejects_with_clear_messages(syn):
    csv = HEAD + ("2026,Durga,Atlantis,pre,BOD,2,,note\n"
                  "2026,Durga,Ghat A,before,BOD,2,1,\n"
                  "2026,Durga,Ghat A,pre,BOD,lots,1,\n"
                  "2026,Durga,Ghat A,pre,BOD,2,,\n"
                  "2026,Durga,Ghat A,pre,Mercury,2,1,\n")
    clean, errors = validate_intake(io.StringIO(csv), syn)
    assert clean.empty and len(errors) == 5
    assert "Row 2" in errors[0] and "unknown site" in errors[0]
    assert "unknown phase" in errors[1] and "not a number" in errors[2]
    assert "source_page or source_note" in errors[3] and "unknown parameter" in errors[4]


def test_accepts_codes_and_appends_in_memory(syn):
    csv = HEAD + "2026,Durga,Ghat A,pre,BOD,2.5,,field sheet\n2026,Durga,Ghat A,pre,pH,*,,field sheet\n"
    clean, errors = validate_intake(io.StringIO(csv), syn)
    assert errors == [] and list(clean["status"]) == ["MEASURED", "NOT_SAMPLED"]
    out = apply_intake(syn, clean)
    assert len(out) == len(syn) + 2 and len(syn) == len(syn)  # original untouched
