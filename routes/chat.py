from flask import Blueprint, request, jsonify
from services.groq_service import ask_ai
from database.firebase import db
from datetime import datetime

chat = Blueprint("chat", __name__)

@chat.route("/chat", methods=["POST"])
def chat_ai():

    try:

        data = request.get_json()

        question = data.get("question")
        email = data.get("email")

        if not question:

            return jsonify({
                "success": False,
                "message": "Question is required."
            }), 400

        prompt = f"""
You are an expert teacher.

Answer the user's question in a clean and attractive format.

Rules:

- Start with a clear heading.
- Use Markdown formatting.
- Use ## headings.
- Use bullet points.
- Highlight important words using **bold**.
- Give one real-life example.
- End with a short summary.

Question:

{question}
"""

        answer = ask_ai(prompt)

        db.collection("activity").add({

            "email": email,

            "action": "chat",

            "day": datetime.now().strftime("%a"),

            "date": datetime.now().strftime("%Y-%m-%d")

        })

        return jsonify({

            "success": True,

            "question": question,

            "answer": answer

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }),500