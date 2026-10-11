# Deploy (Streamlit Community Cloud, backup to the local run)

1. Push the repo (public). Confirm `.env` and `.cache/` are not tracked: `git ls-files .env .cache` prints nothing.
2. share.streamlit.io: New app, pick this repo, branch `main`, main file `app.py`.
3. Advanced settings: Python **3.11**. Secrets (optional, for AI wording):
   ```toml
   CEREBRAS_API_KEY = "..."
   ```
   Without a key the app runs in template mode ("AI off, standard text").
4. Deploy. `requirements.txt` is pinned and has no system dependencies. The app writes only to `.cache/` (LLM cache).
5. After deploying, run `python scripts/cerebras_smoke.py` locally with the key to re-check model IDs, and rotate the key after the event.

Local run:
```
python -m venv .venv && .venv/Scripts/activate   # or source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```
