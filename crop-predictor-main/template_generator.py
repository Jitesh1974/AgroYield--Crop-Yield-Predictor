# template_generator.py
# -*- coding: utf-8 -*-
import csv
import random
import os
from google.cloud import translate_v2 as translate
from templates import get_prescriptive_advice
# ------------------ CONFIG ------------------
INPUT_FILE = "combined.csv"              # dataset
OUTPUT_FILE = "generated_templates.csv"  # generated file
NUM_VARIATIONS = 10                      # variations per row per intent



# Define skeletons for each intent
SKELETONS = {
    "rainfall": [
        "{district}: Expected rainfall is {rainfall} mm, with average temperature {temperature}°C in {Month}.",
        "Rainfall in {district} could reach {rainfall} mm; adjust irrigation accordingly.",
        "IMD predicts {rainfall} mm rain in {district} for {season} season."
    ],
    "irrigation": [
        "For {crop} in {district}, irrigate only if rainfall is below {rainfall} mm in {Month}.",
        "Farmers in {district}: Maintain soil moisture for {crop} if temperature > {temperature}°C.",
        "{district}: Use {fertilizer} and ensure irrigation if soil = {soil}."
    ],
    "sowing": [
        "Do not sow {crop} in {district} if rainfall is {rainfall} mm in {Month}.",
        "For {district}, sowing {crop} is best in {season} season with soil = {soil}.",
        "Check pH={ph} before sowing {crop} in {district}."
    ],
    "yield": [
        "Predicted yield for {crop} in {district} is {yield} quintals/acre (confidence {confidence}).",
        "With rainfall={rainfall} mm and nutrients (N={nitrogen}, P={phosphorus}, K={potassium}), yield of {crop} in {district} is {yield}.",
        "{district}: {crop} expected to produce around {yield} with soil {soil}."
    ],
    "fertilizer": [
        "Apply {fertilizer} for {crop} in {district} when pH={ph}.",
        "Balanced fertilizer ({fertilizer}) helps improve yield for {crop} in {district}.",
        "Farmers in {district} growing {crop} should use {fertilizer} with N={nitrogen}."
    ],
    "pest": [
        "Use pheromone traps to control pests in {crop} at {district}.",
        "{district}: Apply recommended pest management for {crop}.",
        "Preventive spraying may be required in {district} for {crop} if rainfall={rainfall} mm."
    ],
     "alternative_crops": [
        "Since it is {month}, avoid long-duration {crop} in {district}. Grow {alt_crops}.",
        "With rainfall {rainfall} mm in {district}, consider replacing {crop} with {alt_crops}."
    ],
    "water_allocation": [
        "Total water = {water_units}. Allocate {crop_a}={a_units}, {crop_b}={b_units}, {crop_c}={c_units}.",
        "Efficient use: {crop_a}={a_units}, {crop_b}={b_units}, {crop_c}={c_units}."
    ],
    "rainwater_storage": [
        "In {district}, with rainfall {rainfall} mm, invest in {storage}.",
        "Rainwater harvesting in {district} will save water for lean months."
    ],
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




def generate_templates():
    templates = []
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    for row in rows:
        for intent, skeletons in SKELETONS.items():
            for _ in range(NUM_VARIATIONS):
                skeleton = random.choice(skeletons)
                try:
                    text_en = skeleton.format(
                        district=row.get("District_Name", "Unknown"),
                        crop=row.get("Crop", "Unknown"),
                        soil=row.get("Soil_Color", "N/A"),
                        fertilizer=row.get("Fertilizer", "N/A"),
                        rainfall=row.get("Rainfall", "N/A"),
                        season=row.get("Season", "Unknown"),
                        Yield=row.get("Yield", "N/A"),
                        confidence=row.get("Confidence", "75%"),
                        temperature=row.get("Temperature", "25"),
                        nitrogen=row.get("Nitrogen", "N"),
                        phosphorus=row.get("Phosphorus", "P"),
                        potassium=row.get("Potassium", "K"),
                        ph=row.get("pH", "7"),
                        month=row.get("Month", "Unknown"),
                        alt_crops=row.get("Alternative_Crops", "Pulses, Vegetables"),
                        water_units=100,
                        crop_a="Wheat", a_units=60,
                        crop_b="Pulses", b_units=30,
                        crop_c="Vegetables", c_units=10,
                        storage="farm ponds"
                        
                    )

                    # Save English
                    templates.append({"intent": intent, "lang": "en", "template": text_en})

                    # # Translate to Hindi
                    # text_hi = translate_text(text_en, "hi")
                    # templates.append({"intent": intent, "lang": "hi", "template": text_hi})

                    # # Translate to Marathi
                    # text_mr = translate_text(text_en, "mr")
                    # templates.append({"intent": intent, "lang": "mr", "template": text_mr})

                except Exception as e:
                    print("[ERROR]", e)

    # Save generated templates
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["intent", "lang", "template"])
        writer.writeheader()
        writer.writerows(templates)

    print(f"✅ Generated {len(templates)} templates into {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_templates()
