import io
import os
import tempfile
from typing import Optional
import speech_recognition as sr
from gtts import gTTS


class SpeechService:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def text_to_speech(self, text: str) -> bytes:
        try:
            tts = gTTS(text=text, lang="en", slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.read()
        except Exception as e:
            print(f"[SpeechService] TTS error: {e}")
            raise RuntimeError(f"Text-to-speech failed: {e}")

    def speech_to_text(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
        try:
            suffix = ".webm" if "webm" in mime_type else ".wav" if "wav" in mime_type else ".mp3"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            try:
                with sr.AudioFile(tmp_path) as source:
                    audio = self.recognizer.record(source)
            except Exception:
                try:
                    from pydub import AudioSegment
                    audio_segment = AudioSegment.from_file(tmp_path)
                    wav_path = tmp_path.replace(suffix, ".wav")
                    audio_segment.export(wav_path, format="wav")
                    with sr.AudioFile(wav_path) as source:
                        audio = self.recognizer.record(source)
                    os.remove(wav_path)
                except Exception as e2:
                    print(f"[SpeechService] Audio conversion failed: {e2}")
                    os.remove(tmp_path)
                    return ""

            os.remove(tmp_path)

            try:
                text = self.recognizer.recognize_google(audio)
                return text
            except sr.UnknownValueError:
                return "Could not understand audio. Please speak clearly."
            except sr.RequestError as e:
                print(f"[SpeechService] Google Speech API error: {e}")
                return "Speech recognition service unavailable."
        except Exception as e:
            print(f"[SpeechService] STT error: {e}")
            return ""


speech_service = SpeechService()
