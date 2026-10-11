"""Live smoke test (T21): one chat call per model ID in config, one tool call, one strict-schema call.

Run: CEREBRAS_API_KEY=... python scripts/cerebras_smoke.py   (never prints the key)
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ghatwatch.config import load_config  # noqa: E402
from ghatwatch.llm import build_brief_schema, get_client  # noqa: E402


def timed(label, fn):
    t = time.monotonic()
    try:
        out = fn()
        print(f"OK   {label:<38} {time.monotonic() - t:5.2f} s  {out}")
        return True
    except Exception as e:  # report type and status only
        print(f"FAIL {label:<38} {time.monotonic() - t:5.2f} s  {type(e).__name__} {getattr(e, 'status_code', '')}")
        return False


def main() -> int:
    cfg = load_config(Path(__file__).resolve().parents[1] / "config.yaml")
    client = get_client(cfg)
    if client is None:
        print("No client: set CEREBRAS_API_KEY (and provider != none).")
        return 1
    ok = True
    for model in sorted(set(cfg["llm"]["models"].values())):
        ok &= timed(f"chat {model}", lambda m=model: client.chat.completions.create(
            model=m, messages=[{"role": "user", "content": "Reply with the word ready."}],
            max_completion_tokens=200).choices[0].message.content.strip()[:30])
    ask = cfg["llm"]["models"]["ask"]
    tool = [{"type": "function", "function": {"name": "get_ranking", "description": "Ghat ranking",
             "parameters": {"type": "object", "properties": {}, "required": [], "additionalProperties": False}}}]
    ok &= timed(f"tool call {ask}", lambda: [t.function.name for t in (client.chat.completions.create(
        model=ask, tools=tool, messages=[{"role": "user", "content": "Which ghat ranks first? Use the tool."}]
    ).choices[0].message.tool_calls or [])] or "no tool call")
    brief = cfg["llm"]["models"]["brief"]
    schema = build_brief_schema(["Ghat A"])
    ok &= timed(f"strict schema {brief}", lambda: sorted(json.loads(client.chat.completions.create(
        model=brief, messages=[{"role": "user", "content": "Write a one-line brief about Ghat A, no numbers."}],
        response_format={"type": "json_schema", "json_schema": {"name": "brief", "strict": True, "schema": schema}}
    ).choices[0].message.content)))
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
