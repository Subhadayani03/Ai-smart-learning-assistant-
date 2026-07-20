from flask import Blueprint, request, jsonify
from services.groq_service import ask_ai
from database.firebase import db
from datetime import datetime
import json

quiz = Blueprint("quiz", __name__)

@quiz.route("/quiz", methods=["POST"])
def generate_quiz():

    try:

        data = request.get_json()

        topic = data.get("topic")
        email = data.get("email")

        if not topic:

            return jsonify({

                "success": False,

                "message": "Topic is required."

            }),400

        prompt = f"""
Generate exactly 10 Multiple Choice Questions about "{topic}".

Return ONLY valid JSON.

Example:

[
    {{
        "question":"What is Python?",
        "options":[
            "Programming Language",
            "Snake",
            "Car",
            "Operating System"
        ],
        "answer":0
    }}
]

Rules:

- Exactly 10 questions
- Exactly 4 options
- answer must be option index
- Return only JSON
"""

        answer = ask_ai(prompt)

        answer = answer.replace("```json", "")
        answer = answer.replace("```", "")
        answer = answer.strip()

        quiz_data = json.loads(answer)

        db.collection("quiz").add({

            "email": email,

            "topic": topic,

            "questions": quiz_data,

            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        })

        db.collection("activity").add({

            "email": email,

            "action": "quiz",

            "day": datetime.now().strftime("%a"),

            "date": datetime.now().strftime("%Y-%m-%d")

        })

        return jsonify({

            "success": True,

            "quiz": quiz_data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }),500