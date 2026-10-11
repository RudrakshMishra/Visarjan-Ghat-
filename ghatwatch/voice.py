"""Voice assistant for ghatwatch: transcription (SpeechRecognition) and synthesis (gTTS)."""
from __future__ import annotations

import io
import speech_recognition as sr
from gtts import gTTS
import streamlit as st

def transcribe_audio(audio_data: bytes, lang: str = "en") -> str:
    """Transcribe audio bytes to text."""
    recognizer = sr.Recognizer()
    audio_file = io.BytesIO(audio_data)

    # Needs to be a valid audio format
    with sr.AudioFile(audio_file) as source:
        audio = recognizer.record(source)

    try:
        # Convert language code to speech_recognition supported format
        sr_lang = "hi-IN" if lang == "hi" else "en-US"
        return recognizer.recognize_google(audio, language=sr_lang)
    except Exception as e:
        return f"Error: {e}"

def synthesize_speech(text: str, lang: str = "en") -> io.BytesIO:
    """Synthesize text to audio bytes."""
    # gTTS doesn't support 'hng' directly, fallback to 'hi' or 'en'
    tts_lang = "hi" if lang in ["hi", "hng"] else "en"
    tts = gTTS(text=text, lang=tts_lang, slow=False)

    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp
