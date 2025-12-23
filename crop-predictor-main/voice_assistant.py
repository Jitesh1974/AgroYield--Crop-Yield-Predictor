
"""
voice_assistant_fixed.py
Robust speech -> transcription -> intent -> spoken reply demo.

Features:
- Checks for common filename conflicts (e.g., string.py).
- Verifies ffmpeg is available.
- Records audio using sounddevice (if available) or accepts a WAV file.
- Uses OpenAI Whisper for ASR (model size default = tiny).
- Simple keyword-based intent detection (Marathi/Hindi-friendly).
- Offline TTS using pyttsx3 (no internet required).
- Clear error messages and guidance.
"""

import os
import sys
import argparse
import shutil
import subprocess
import time
import re
from templates import generate_filled_template,get_final_response
from dataset_connector import load_dataset, lookup_dataset,localize_row


DEFAULT_WAV = "input.wav"



KEYWORDS = {
    "irrigation": ["पाणी", "सिंचन", "पानी", "irrigate", "water", "सिंच"],
    "fertilizer": ["खत", "उर्वरक", "fertilizer", "khate", "खते"],
    "pest": ["कीड", "कीडपिडा", "कीडपिळ", "pest", "रोग", "कीटक"],
    "sowing": ["पेरणी", "बुवाई", "बिया", "buaa", "सोन"],
    "yield": ["उत्पन्न", "उत्पन्न किती", "yield", "उपज"],
}

DISTRICT_LOCALIZATION = {
    "Jodhpur": ["jodhpur", "जोधपुर", "जोधपूर"],
    "Kolhapur": ["kolhapur", "कोल्हापुर", "कोल्हापूर"],
    "Satara":   ["satara", "सातारा", "सातरा"],
    "North Delhi": ["north delhi", "उत्तर दिल्ली", "नॉर्थ दिल्ली"],

}

CROP_LOCALIZATION = {
    "Bajra": ["bajra", "बाजरा", "बाजरी"],
    "Maize": ["maize", "मक्का", "मका"],
    "Jowar": ["jowar", "ज्वार", "ज्वारी"],
    "Soybean": ["Soybean", "सोयाबीन", "सोयाबिन"],
    "Wheat": ["Wheat", "गहू", "गेहूं"],
    "Rice": ["rice", "चावल", "भात"],
    
}
SEASON_LOCALIZATION = {
    "Kharif": ["kharif", "खरीफ", "खरीफ हंगाम"],
    "Rabi": ["rabi", "रबी", "रब्बी हंगाम"],
    "Zaid": ["zaid", "जायद", "जायड"]
}

# ---------- HELPERS ----------
def abort(msg):
    print("\nERROR:", msg)
    print("Exiting.")
    sys.exit(1)

def check_for_stdlib_conflicts():
    bad_names = ["string.py", "os.py", "sys.py", "subprocess.py", "logging.py", "json.py"]
    cwd = os.getcwd()
    conflicts = []
    for name in bad_names:
        if os.path.exists(os.path.join(cwd, name)):
            conflicts.append(name)
    if conflicts:
        print("Detected filenames that shadow Python standard library modules:")
        for c in conflicts:
            print("  -", c)
        abort("Please rename/delete these files and retry (they prevent imports).")

def check_ffmpeg():
    ff = shutil.which("ffmpeg")
    if ff:
        print("[check] ffmpeg found at:", ff)
        return True
    print("[check] ffmpeg not found in PATH.")
    print("  -> Please install ffmpeg and add it to your PATH.")
    return False

def ensure_python_packages():
    missing = []
    modules = {
        "whisper": "openai-whisper",
        "sounddevice": "sounddevice",
        "soundfile": "soundfile",
        "pyttsx3": "pyttsx3",
        "langdetect": "langdetect",
    }
    for mod, pkg in modules.items():
        try:
            __import__(mod)
        except Exception:
            missing.append((mod, pkg))
    try:
        import torch 
    except Exception:
        missing.append(("torch", "torch"))

    if missing:
        print("[check] Missing Python packages:")
        for mod, pkg in missing:
            print("  -", pkg, "(import name:", mod, ")")
        print("\nInstall suggestions:")
        print("  pip install torch")
        print("  pip install openai-whisper sounddevice soundfile pyttsx3 langdetect")
        abort("Please install the missing packages and rerun the script.")
    return True


def record_audio(filename=DEFAULT_WAV, duration=6, fs=16000):
    try:
        import sounddevice as sd
        import soundfile as sf
    except Exception as e:
        abort("sounddevice/soundfile not available. Error: " + str(e))

    print(f"[record] Recording for {duration}s ... speak now.")
    try:
        rec = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
        sd.wait()
        sf.write(filename, rec, fs)
        print("[record] Saved audio to:", filename)
        return filename
    except Exception as e:
        abort("Recording failed: " + str(e))
def transcribe_with_google(lang="hi-IN", timeout=6):
    try:
        import speech_recognition as sr
    except Exception:
        print("[asr] speech_recognition not installed.")
        return "", None

    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    print(f"[asr] Recording for Google ASR ({lang}) ...")
    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        try:
            audio = recognizer.listen(source, timeout=timeout)
        except Exception as e:
            print("[asr] Google ASR recording failed:", e)
            return "", None

    try:
        text = recognizer.recognize_google(audio, language=lang)
        return text.strip(), lang
    except Exception as e:
        print("[asr] Google ASR error:", e)
        return "", None
def transcribe_with_whisper(audio_path, model_size="small"):
    try:
        import whisper
    except Exception:
        abort("Whisper not installed. Install with: pip install openai-whisper")

    print("[asr] Loading Whisper model:", model_size)
    try:
        model = whisper.load_model(model_size)
    except Exception as e:
        abort("Failed to load Whisper model: " + str(e))

    print("[asr] Transcribing ...")
    try:
        result = model.transcribe(audio_path, fp16=False)
        text = result.get("text", "").strip()
        lang = result.get("language", None)
        return text, lang or None
    except Exception as e:
        abort("Whisper transcription failed: " + str(e))
INTENT_KEYWORDS = {
    "irrigation": ["irrigation", "पानी", "सिंचाई", "पाणी"],
    "fertilizer": ["fertilizer", "खत", "खाद", "खते"],
    "yield": ["yield", "उपज", "उत्पादन", "उत्पन्न"],
    "rainfall": ["rainfall", "बारिश", "वर्षा", "पाऊस"],
    "pest": ["pest", "कीट", "कीडे", "माहू", "किडे"],
    "alternative_crops": ["alternative", "what else", "और क्या बोऊं", "काय लावू", "काय पिकं"],
    "water_allocation": ["divide water", "allocate water", "पाणी वाटप", "जल वितरण"],
    "rainwater_storage": ["save water", "store rain", "rainwater harvesting", "जल संग्रहण", "पावसाचे पाणी"],
        "district": [
        "kolhapur", "कोल्हापुर", "कोल्हापूर",
        "satara", "सातारा", "सातरा",
        "jodhpur", "जोधपुर", "जोधपूर",
        "delhi", "north delhi", "दिल्ली", "नॉर्थ दिल्ली"
    ],

    # NEW: Crops as intents
    "crop": [
        "bajra", "बाजरा", "बाजरी",
        "maize", "मक्का", "मका",
        "jowar", "ज्वार", "ज्वारी",
        "soybean", "सोयाबीन", "सोयाबिन",
        "wheat", "गहू", "गेहूं",
        "rice", "धान", "तांदूळ", "भात"
    ]
     
}
def detect_intent(text):
    if not text:
        return "unknown"
    t = text.lower()
    for intent, kws in INTENT_KEYWORDS.items():
        for kw in kws:
            if kw in t:
                return intent
    return "unknown"

# DISTRICT_LOCALIZATION = {
#     "en": {
#         "Jodhpur": "Jodhpur",
#         "Kolhapur": "Kolhapur",
#         "Satara": "Satara",
#     },
#     "hi": {
#         "Jodhpur": "जोधपुर",
#         "Kolhapur": "कोल्हापुर",
#         "Satara": "सातारा",
#     },
#     "mr": {
#         "Jodhpur": "जोधपूर",
#         "Kolhapur": "कोल्हापूर",
#         "Satara": "सातारा",
#     },
# }


def detect_district(text):
    t = text.lower()
    for eng, aliases in DISTRICT_LOCALIZATION.items():
        for a in aliases:
            if a.lower() in t:
                return eng.capitalize()
    return None


def detect_crop(text):
    t = text.lower()
    for eng, aliases in CROP_LOCALIZATION.items():
        for a in aliases:
            if a.lower() in t:
                return eng
    return None

def detect_season(text):
    t = text.lower()
    for eng, aliases in SEASON_LOCALIZATION.items():
        for a in aliases:
            if a.lower() in t:
                return eng
    return "Unknown"
_known_lists_cache = None

def _build_known_lists():
    global _known_lists_cache
    if _known_lists_cache is not None:
        return _known_lists_cache

    rows = load_dataset()
    districts, crops = [], []
    for r in rows:
        dn = r.get("District_Name") or r.get("district_name") or r.get("district")
        cp = r.get("Crop") or r.get("crop")
        if dn and dn.strip().lower() not in (d.lower() for d in districts):
            districts.append(dn.strip())
        if cp and cp.strip().lower() not in (c.lower() for c in crops):
            crops.append(cp.strip())
    districts.sort(key=lambda s: -len(s))
    crops.sort(key=lambda s: -len(s))
    _known_lists_cache = {"districts": districts, "crops": crops}
    return _known_lists_cache

def extract_district_and_crop_from_text(user_text):
    """
    Robust: detect district and crop appearing in user_text in any language (hi/mr/en).
    Returns canonical English names (matching dataset) for district and crop where possible.
    """
    if not user_text:
        return None, None
    t = user_text.lower()
    try:
        rows = load_dataset()
    except Exception:
        rows = []
    ds_districts = set()
    ds_crops = set()
    for r in rows:
        dn = (r.get("District_Name") or r.get("district_name") or r.get("district") or "").strip()
        cp = (r.get("Crop") or r.get("crop") or "").strip()
        if dn:
            ds_districts.add(dn.lower())
        if cp:
            ds_crops.add(cp.lower())


    for dn in ds_districts:
        if dn in t:

            found_crop = None
            for cp in ds_crops:
                if cp in t:
                    found_crop = cp.capitalize()
                    break
            return dn.capitalize(), found_crop
    for eng, aliases in DISTRICT_LOCALIZATION.items():
        for a in aliases:
            if a.lower() in t:
                found_crop = None
                for ceng, caliases in CROP_LOCALIZATION.items():
                    for ca in caliases:
                        if ca.lower() in t:
                            found_crop = ceng
                            break
                    if found_crop:
                        break
                return eng, found_crop
    for eng, aliases in CROP_LOCALIZATION.items():
        for a in aliases:
            if a.lower() in t:
                return None, eng

    return None, None


# voice_assistant_fixed.py - NEW generate_reply function

from templates import get_prescriptive_advice
from dataset_connector import load_dataset
import ml_connector

def generate_reply(intent, lang_code=None, user_text=None):
    """
    Generates a merged prescriptive advisory reply (rainfall + irrigation + sowing + yield + fertilizer + pest + storage).
    Uses dataset + ML + rule-based advice from templates.py.
    """

    # Detect language
    lang = "en"
    if lang_code:
        l = str(lang_code).lower()
        if l.startswith("mr") or "marathi" in l:
            lang = "mr"
        elif l.startswith("hi") or "hindi" in l:
            lang = "hi"
        elif l.startswith("en") or "english" in l:
            lang = "en"

    # --- STEP 1: Load dataset ---
    try:
        rows = load_dataset()
    except Exception as e:
        print(f"[data-error] Failed to load dataset: {e}")
        rows = []

    # --- STEP 2: Detect entities (district, crop, season, month) ---
    district, crop = None, None
    if user_text:
        district = detect_district(user_text)
        crop = detect_crop(user_text)
        season = detect_season(user_text)
    else:
        season = "Unknown"

    # --- STEP 3: Fallback row from dataset ---
    fallback_row = {}
    if rows:
        for r in rows:
            if district and r.get("District_Name", "").lower() == district.lower():
                if crop and r.get("Crop", "").lower() == crop.lower():
                    fallback_row = r
                    break
        if not fallback_row:
            fallback_row = rows[0]

    # --- STEP 4: Dynamic weather (Rainfall + Temperature) ---
    dynamic_weather = ml_connector.get_dynamic_rainfall_and_temp(
        district or fallback_row.get("District_Name", "Kolhapur"),
        "current_month"
    )

    # --- STEP 5: Build features dict ---
    features = {
        "District_Name": district or fallback_row.get("District_Name", "Kolhapur"),
        "Crop": crop or fallback_row.get("Crop", "Wheat"),
        "Season": season or fallback_row.get("Season", "Rabi"),
        "Month": fallback_row.get("Month", "July"),
        "Rainfall": dynamic_weather.get("Rainfall", fallback_row.get("Rainfall", "200")),
        "Temperature": dynamic_weather.get("Temperature", fallback_row.get("Temperature", "28")),
        "Nitrogen": fallback_row.get("Nitrogen", "50"),
        "Phosphorus": fallback_row.get("Phosphorus", "30"),
        "Potassium": fallback_row.get("Potassium", "20"),
        "pH": fallback_row.get("pH", "7"),
        "Fertilizer": fallback_row.get("Fertilizer", "Urea"),
        "Soil_color": fallback_row.get("Soil_color", "Black"),
    }

    # --- STEP 6: Predict yield ---
    try:
        predicted_yield = ml_connector.get_yield_prediction(features)
    except Exception as e:
        print(f"[ML-ERROR] Yield prediction failed: {e}")
        predicted_yield = "N/A"

    features["Yield"] = predicted_yield

    # --- STEP 7: Generate advisory ---
    try:
        reply = get_prescriptive_advice(
            district=features["District_Name"],
            crop=features["Crop"],
            month=features["Month"],
            season=features["Season"],
            rainfall=float(features["Rainfall"]),
            temperature=float(features["Temperature"]),
            soil=features["Soil_color"],
            fertilizer=features["Fertilizer"],
            nitrogen=features["Nitrogen"],
            phosphorus=features["Phosphorus"],
            potassium=features["Potassium"],
            ph=features["pH"],
            predicted_yield=features["Yield"]
        )
    except Exception as e:
        reply = f"Sorry, I could not generate advisory: {e}"

    return reply


def main():
    
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true")
    parser.add_argument("--duration", type=float, default=6.0)
    parser.add_argument("--file", type=str)
    parser.add_argument("--model", type=str, default="tiny")
    parser.add_argument("--use_google", action="store_true")
    args = parser.parse_args()

    check_for_stdlib_conflicts()
    if not check_ffmpeg():
        abort("ffmpeg required.")
    ensure_python_packages()

    if args.record:
        audio_path = record_audio(filename=DEFAULT_WAV, duration=args.duration)
    elif args.file:
        if not os.path.exists(args.file):
            abort(f"File not found: {args.file}")
        audio_path = args.file
    else:
        audio_path = record_audio(filename=DEFAULT_WAV, duration=args.duration)

    text, lang = "", None
    if args.use_google:
        text, lang = transcribe_with_google(lang="hi-IN")
    if not text:
        text, lang = transcribe_with_whisper(audio_path, model_size=args.model)
    if not text.strip():
        print("📝 No speech. Type your query:")
        text = input("You: ")
        if re.search("[a-zA-Z]", text):
            lang = "en"
        elif re.search("[\u0900-\u097F]", text):
            lang = "hi"
        else:
            lang = "hi"

    try:
        from langdetect import detect
        detected_lang = detect(text)
        if detected_lang != lang:
            print(f"[lang-fix] Overriding {lang} → {detected_lang}")
            lang = detected_lang
    except Exception:
        pass

    print("\n--- TRANSCRIPTION ---")
    print(text)
    print("--- /TRANSCRIPTION ---\n")
    print("[info] Detected language:", lang)

    intent = detect_intent(text or "")
    print("[info] Detected intent:", intent)
    reply = generate_reply(intent, lang_code=lang, user_text=text)
    print("[reply]", reply)
    # speak_offline(reply)
   

    print("[done]")

if __name__ == "__main__":
 
    if "--text" in sys.argv:
        idx = sys.argv.index("--text")
        user_query = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else ""
        lang = "en"
        intent = detect_intent(user_query)
        reply = generate_reply(intent, lang_code=lang, user_text=user_query)
        print(reply)
    else:
        main()
