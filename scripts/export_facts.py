"""Write the real facts.json (stdout or a file): python scripts/export_facts.py [out.json]."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ghatwatch.service import get_facts, load_context  # noqa: E402

if __name__ == "__main__":
    text = json.dumps(get_facts(load_context()), ensure_ascii=False, indent=2)
    if len(sys.argv) > 1:
        Path(sys.argv[1]).write_text(text, encoding="utf-8")
    else:
        sys.stdout.reconfigure(encoding="utf-8")
        print(text)
