import streamlit as st
from ghatwatch.askdata import answer
from ghatwatch.guard import guard_badge
from ghatwatch.service import load_context
from ghatwatch import voice

WITHHELD = "Answer withheld: it did not pass the Claim Guard."


# Load config, readings and rules once
@st.cache_resource
def get_context():
    return load_context()

ctx = get_context()

# Sidebar settings (no login: PRD section 5, plan rule 8)
st.sidebar.title("Settings")

# Language Selection
lang = st.sidebar.selectbox("Language", options=["en", "hi", "hng"], format_func=lambda x: {"en": "English", "hi": "Hindi", "hng": "Hinglish"}[x])

# Voice sends audio and answers to Google speech services, so it is off until the officer turns it on
use_voice = st.sidebar.toggle("Voice input and output", value=False,
                              help="Sends your recording and the answer text to Google speech services.")

st.title("Ghat Watch Dashboard")

# Placeholder for dashboard content
st.subheader("Ranking")
st.write("Loading core data...")

# Chatbot UI
st.subheader("Multilingual AI Assistant")
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat Input: Text or Audio
audio_value = st.audio_input("Or record your question...") if use_voice else None

prompt = st.chat_input("Ask a question (Hindi/English/Hinglish)...")

if audio_value:
    with st.spinner("Transcribing..."):
        transcript = voice.transcribe_audio(audio_value.read(), lang=lang)
    if transcript:
        prompt = transcript
        st.write(f"Transcribed: {transcript}")
    else:
        st.warning("Could not transcribe the recording. Please type your question.")

if prompt:
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        # answer() runs the Input Guard, the five fixed data tools and the Claim Guard
        response, result, _ = answer(prompt, ctx.df, ctx.rules, ctx.cfg)
        if not result.ok:
            response = WITHHELD
        st.markdown(response)
        st.caption(guard_badge(result))

        # Speak the response
        if use_voice:
            audio_fp = voice.synthesize_speech(response, lang=lang)
            st.audio(audio_fp, format="audio/mp3")

    st.session_state.messages.append({"role": "assistant", "content": response})
