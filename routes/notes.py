from flask import Blueprint, request, jsonify
from services.groq_service import ask_ai
from database.firebase import db
from datetime import datetime

notes = Blueprint("notes", __name__)

@notes.route("/notes", methods=["POST"])
def generate_notes():

    try:

        data = request.get_json()

        topic = data.get("topic")
        email = data.get("email")

        if not topic:
            return jsonify({
                "success": False,
                "message": "Topic is required."
            }), 400

        prompt = f"""
You are an expert teacher.

Create detailed study notes about "{topic}".

Instructions:
- Use simple English.
- Add proper headings.
- Use bullet points.
- Highlight important keywords.
- Give one simple example.
- End with a short summary.
"""

        answer = ask_ai(prompt)

        # Save Notes
        db.collection("notes").add({
            "email": email,
            "topic": topic,
            "notes": answer,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

        # Save Activity
        db.collection("activity").add({
            "email": email,
            "action": "notes",
            "day": datetime.now().strftime("%a"),
            "date": datetime.now().strftime("%Y-%m-%d")
        })

        return jsonify({
            "success": True,
            "topic": topic,
            "notes": answer
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500