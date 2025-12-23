# reply_generator.py
import random
from templates import TEMPLATES
from data_loader import get_latest_value, get_average

def generate_reply(intent, lang, district="Nagpur", crop="Wheat"):
    """
    Generate a reply based on intent, language, dataset, and templates.
    """
    if intent not in TEMPLATES:
        return "❌ Unknown intent."
    if lang not in TEMPLATES[intent]:
        return "❌ Language not supported."

    # Pick a random template for variety
    template = random.choice(TEMPLATES[intent][lang])

    # Collect dataset values
    rainfall = get_average(district, "PrecipitationSumInches") or "N/A"
    soil = get_latest_value(district, "SoilType") or "Loamy"
    fertilizer = "Urea"  # Placeholder → could map from dataset later
    pest = "Aphids"      # Placeholder
    season = "Kharif"    # Placeholder
    yield_pred = random.randint(15, 30)  # Dummy prediction
    confidence = round(random.uniform(0.7, 0.95), 2)

    # Replace placeholders in the template
    reply = template.format(
        crop=crop,
        district=district,
        rainfall=rainfall,
        soil=soil,
        fertilizer=fertilizer,
        pest=pest,
        season=season,
  
        confidence=confidence
    )

    return reply
