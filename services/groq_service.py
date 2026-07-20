import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Updated model
MODEL = "llama-3.1-8b-instant"


def ask_ai(prompt):

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }

    try:

        response = requests.post(
            GROQ_URL,
            headers=headers,
            json=body,
            timeout=60
        )

        response.raise_for_status()

        return response.json()["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as e:

        return f"Groq Error: {e}"

    except Exception as e:

        return f"Unexpected Error: {e}"