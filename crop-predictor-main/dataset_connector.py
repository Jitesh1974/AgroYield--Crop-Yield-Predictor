import csv
import os

# Path to your dataset (Final_Dataset_2.csv in same folder)
DATASET_PATH = os.path.join(os.path.dirname(__file__), "combined.csv")

# Cache for loaded rows
_dataset_cache = []

# dataset_connector.py (add at bottom)

# Simple dictionaries for translating placeholders
TRANSLATIONS = {
    "hi": {
        "district": {
            "Jodhpur": "जोधपुर",
            "Kolhapur": "कोल्हापुर",
            "Pune": "पुणे",
        },
        "crop": {
            "Bajra": "बाजरा",
            "Maize": "मक्का",
        },
        "soil": {
            "Pale Yellow": "फीका पीला",
            "Light Brown": "हल्का भूरा",
            "Yellow Brown": "पीला-भूरा",
            "Sandy Brown": "रेतीला भूरा",
            "Dark Brown": "गहरा भूरा",
        },
    },
    "mr": {
        "district": {
            "Jodhpur": "जोधपूर",
            "Kolhapur": "कोल्हापूर",
            "Pune": "पुणे",
        },
        "crop": {
            "Bajra": "बाजरी",
            "Maize": "मका",
        },
        "soil": {
            "Pale Yellow": "फिकट पिवळा",
            "Light Brown": "फिकट तपकिरी",
            "Yellow Brown": "पिवळट तपकिरी",
            "Sandy Brown": "वालुकामय तपकिरी",
            "Dark Brown": "गडद तपकिरी",
        },
    },
}

def localize_row(row_dict, lang_code="en"):
    """
    Translate district/crop/soil fields if lang_code is hi/mr.
    """
    lang = "hi" if str(lang_code).startswith("hi") else "mr" if str(lang_code).startswith("mr") else "en"
    if lang == "en":
        return row_dict  # no change

    translated = dict(row_dict)
    for field in ["district", "crop", "soil"]:
        original = row_dict.get(field, "")
        mapping = TRANSLATIONS.get(lang, {}).get(field, {})
        if original in mapping:
            translated[field] = mapping[original]
    return translated

def load_dataset():
    """Load the CSV once into memory."""
    global _dataset_cache
    if _dataset_cache:
        return _dataset_cache

    try:
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            _dataset_cache = [row for row in reader]
    except Exception as e:
        print(f"[ERROR] Could not load dataset: {e}")
        _dataset_cache = []

    return _dataset_cache


def lookup_dataset(intent, district=None, crop=None):
    """
    Look up dataset values for district & crop.
    Returns dict with placeholders for templates.
    """
    rows = load_dataset()

    district = (district or "").strip().lower()
    crop = (crop or "").strip().lower()

    # 1. Exact match: district + crop
    for row in rows:
        if (row.get("District_Name", "").strip().lower() == district and
                row.get("Crop", "").strip().lower() == crop):
            return normalize_row(row)

    # 2. Match by district only
    for row in rows:
        if row.get("District_Name", "").strip().lower() == district:
            return normalize_row(row)

    # 3. Match by crop only
    for row in rows:
        if row.get("Crop", "").strip().lower() == crop:
            return normalize_row(row)

    # 4. Default → first row
    return normalize_row(rows[0]) if rows else {}
def safe_value(val, default):
    if not val or str(val).strip().upper() in ("N/A", "NA", "UNKNOWN", "NULL", "NONE", "0"):
        return default
    return val
def normalize_row(row):
    """Map dataset row to clean placeholders for templates."""
    # Safe numeric extraction
    def safe_float(val, default=0.0):
        try:
            return float(val)
        except:
            return default

    rainfall = safe_float(row.get("Rainfall"))
    temperature = safe_float(row.get("Temperature"))
    nitrogen = safe_float(row.get("Nitrogen"))
    phosphorus = safe_float(row.get("Phosphorus"))
    potassium = safe_float(row.get("Potassium"))

    # --- Season inference ---
    if rainfall > 300 and 20 <= temperature <= 30:
        season = "Kharif"
    elif rainfall < 150 and temperature < 25:
        season = "Rabi"
    elif rainfall > 0:
        season = "Zaid"
    else:
        season = "General"

    # --- Yield estimate (simple demo formula) ---
    yield_estimate = round((rainfall * 0.02) + (nitrogen + phosphorus + potassium) / 100, 2)
    yield_text = f"{yield_estimate} quintals/acre" if yield_estimate > 0 else "Data not available"

    # --- Confidence ---
    if 100 <= nitrogen <= 200 and 10 <= phosphorus <= 30 and 150 <= potassium <= 300:
        confidence = "High"
    elif nitrogen and phosphorus and potassium:
        confidence = "Medium"
    else:
        confidence = "Low"

    return {
    "district": safe_value(row.get("District_Name"), "your district"),
    "crop": safe_value(row.get("Crop"), "your crop"),
    "soil": safe_value(row.get("Soil_Color"), "soil"),
    "rainfall": safe_value(row.get("Rainfall"), "not recorded"),
    "fertilizer": safe_value(row.get("Fertilizer"), "fertilizer"),
    "nitrogen": safe_value(row.get("Nitrogen"), "N"),
    "phosphorus": safe_value(row.get("Phosphorus"), "P"),
    "potassium": safe_value(row.get("Potassium"), "K"),
    "ph": safe_value(row.get("pH"), "7"),
    "temperature": safe_value(row.get("Temperature"), "25"),
    "pest": "not observed",
    "season": safe_value(season, "current season"),
    "yield": safe_value(yield_text, "~20 quintals/acre"),
    "confidence": safe_value(confidence, "Medium"),
}




TRANSLATIONS = {
    "soil": {
        "Pale Yellow": {"hi": "फीका पीला", "mr": "फिकट पिवळा"},
        "Light Brown": {"hi": "हल्का भूरा", "mr": "फिकट तपकिरी"},
        "Yellow Brown": {"hi": "पीला भूरा", "mr": "पिवळसर तपकिरी"},
        "Sandy Brown": {"hi": "रेतीला भूरा", "mr": "वालुकामय तपकिरी"},
        "Dark Brown": {"hi": "गहरा भूरा", "mr": "गडद तपकिरी"},
    },
    "district": {
        "Jodhpur": {"hi": "जोधपुर", "mr": "जोधपूर"},
        "Kolhapur": {"hi": "कोल्हापुर", "mr": "कोल्हापूर"},
        "Satara": {"hi": "सातारा", "mr": "सातारा"},
    },
    "crop": {
        "Bajra": {"hi": "बाजरा", "mr": "बाजरी"},
        "Maize": {"hi": "मक्का", "mr": "मका"},
        "Jowar": {"hi": "ज्वार", "mr": "ज्वारी"},
    },
    "fertilizer": {
        "DAP": {"hi": "डीएपी", "mr": "डीएपी"},
        "Urea": {"hi": "यूरिया", "mr": "युरिया"},
        "Compost": {"hi": "खाद", "mr": "खत"},
        "MOP": {"hi": "एमओपी", "mr": "एमओपी"},
        "FYM": {"hi": "गोबर खाद", "mr": "गोठ्यातील खत"},
        "Vermicompost": {"hi": "वर्मी कम्पोस्ट", "mr": "वर्मी कम्पोस्ट"},
    },
}

def localize_row(row, lang="en"):
    """Return localized copy of row according to lang (en/hi/mr)."""
    if lang not in ("hi", "mr"):
        return row  # English = default
    
    new_row = row.copy()
    # soil
    if row.get("soil") in TRANSLATIONS["soil"]:
        new_row["soil"] = TRANSLATIONS["soil"][row["soil"]].get(lang, row["soil"])
    # district
    if row.get("district") in TRANSLATIONS["district"]:
        new_row["district"] = TRANSLATIONS["district"][row["district"]].get(lang, row["district"])
    # crop
    if row.get("crop") in TRANSLATIONS["crop"]:
        new_row["crop"] = TRANSLATIONS["crop"][row["crop"]].get(lang, row["crop"])
    # fertilizer
    if row.get("fertilizer") in TRANSLATIONS["fertilizer"]:
        new_row["fertilizer"] = TRANSLATIONS["fertilizer"][row["fertilizer"]].get(lang, row["fertilizer"])
    
    return new_row

