import streamlit as st
import pandas as pd
import yaml
import os
from ghatwatch.loader import load_readings
from ghatwatch.askdata import ask_data
from ghatwatch.guard import check_output
from ghatwatch import voice

# Load config
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Load data - assuming this is the primary file
@st.cache_data
def load_all_data():
    return load_readings("data/bhopal_ghats_2023_2025.csv")

df = load_all_data()

# Sidebar for Auth and Settings
st.sidebar.title("Login & Settings")
username = st.sidebar.text_input("Username")
password = st.sidebar.text_input("Password", type="password")

# Language Selection
lang = st.sidebar.selectbox("Language", options=["en", "hi", "hng"], format_func=lambda x: {"en": "English", "hi": "Hindi", "hng": "Hinglish"}[x])

if st.sidebar.button("Login"):
    # Simple auth for hackathon - in real app, use better hashing/session management
    if username == "admin" and password == "ghatwatch2026":
        st.session_state.authenticated = True
        st.sidebar.success("Logged in!")
    else:
        st.sidebar.error("Invalid credentials")
        st.session_state.authenticated = False

if not st.session_state.get("authenticated", False):
    st.title("Ghat Watch - BMC Officer Portal")
    st.info("Please log in to access the Ghat Risk Dashboard.")
else:
    st.title("Ghat Watch Dashboard")
    st.write("Welcome, authorized officer.")

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
    audio_value = st.audio_input("Or record your question...")

    prompt = st.chat_input("Ask a question (Hindi/English/Hinglish)...")

    if audio_value:
        with st.spinner("Transcribing..."):
            prompt = voice.transcribe_audio(audio_value.read(), lang=lang)
            st.write(f"Transcribed: {prompt}")

    if prompt:
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            # Use ask_data and guard
            response = ask_data(df, prompt)
            response = check_output(response)
            st.markdown(response)

            # Speak the response
            audio_fp = voice.synthesize_speech(response, lang=lang)
            st.audio(audio_fp, format="audio/mp3")

        st.session_state.messages.append({"role": "assistant", "content": response})
