import streamlit as st
import pandas as pd
import yaml
import os

# Load config
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Sidebar for Auth
st.sidebar.title("Login")
username = st.sidebar.text_input("Username")
password = st.sidebar.text_input("Password", type="password")

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

    if prompt := st.chat_input("Ask a question (Hindi/English/Hinglish)..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            # Placeholder for actual LLM call
            response = f"Simulated assistant answer to: {prompt}"
            st.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})
