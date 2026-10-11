def evidence_for(row: dict) -> dict:
    """
    row: dict representation of a row from the normalized DataFrame.
    Returns evidence dictionary with mandatory fields:
    value_as_printed, parameter_as_printed, unit, year, festival, phase, page, url
    """

    # PDF URLs (from TRD section 4)
    PDF_URLS = {
        2025: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf",
        2024: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2024.pdf",
        2023: "https://www.mppcb.mp.gov.in/proc/mon/Idol_immer._Report_23_CPCB.pdf"
    }

    year = row.get('year')
    page = row.get('source_page')

    url = PDF_URLS.get(year, "")
    if page:
        url += f"#page={page}"

    return {
        "value_as_printed": row.get('value_as_printed', 'N/A'),
        "parameter_as_printed": row.get('parameter_as_printed', 'N/A'),
        "unit": row.get('unit_assumed', 'mg/l'),
        "year": year,
        "festival": row.get('festival', 'N/A'),
        "phase": row.get('phase', 'N/A'),
        "page": page,
        "url": url
    }
