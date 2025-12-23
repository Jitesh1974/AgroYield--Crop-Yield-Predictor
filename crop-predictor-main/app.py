# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from voice_assistant import generate_reply  # <-- make sure this exists

app = FastAPI()

# Allow only your frontend (http://localhost:8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "✅ Backend is running fine!"}

@app.post("/chat")
async def chat_endpoint(payload: dict):
    user_message = payload.get("message", "")
    lang = payload.get("lang", "en")

    try:
        # Here we call your NLP engine
        reply = generate_reply("unknown", lang_code=lang, user_text=user_message)
    except Exception as e:
        reply = f"⚠️ Error in NLP: {str(e)}"

    return {"reply": reply}
