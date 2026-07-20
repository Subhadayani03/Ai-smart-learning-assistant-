from flask import Blueprint, jsonify, request
from database.firebase import db

dashboard = Blueprint("dashboard", __name__)

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


@dashboard.route("/dashboard", methods=["GET"])
def get_dashboard():

    try:

        email = request.args.get("email")

        if not email:

            return jsonify({

                "success": False,

                "message": "Email is required"

            }),400

        # ==========================
        # Notes Count
        # ==========================

        notes_docs = list(

            db.collection("notes")

            .where("email","==",email)

            .stream()

        )

        notes_count = len(notes_docs)

        # ==========================
        # Quiz Count
        # ==========================

        quiz_docs = list(

            db.collection("quiz")

            .where("email","==",email)

            .stream()

        )

        quiz_count = len(quiz_docs)

        # ==========================
        # Progress
        # ==========================

        progress_docs = list(

            db.collection("progress")

            .where("email","==",email)

            .stream()

        )

        total_progress = 0

        progress_count = 0

        highest_progress = 0

        for doc in progress_docs:

            item = doc.to_dict()

            percentage = int(item.get("percentage",0))

            total_progress += percentage

            progress_count += 1

            if percentage > highest_progress:

                highest_progress = percentage

        if progress_count > 0:

            overall_progress = round(

                total_progress / progress_count

            )

        else:

            overall_progress = 0

        # ==========================
        # Weekly Activity
        # ==========================

        graph = {}

        total_usage = 0

        for day in DAYS:

            activity_docs = list(

                db.collection("activity")

                .where("email","==",email)

                .where("day","==",day)

                .stream()

            )

            graph[day] = len(activity_docs)

            total_usage += len(activity_docs)

        # ==========================
        # Response
        # ==========================

        return jsonify({

            "success": True,

            "dashboard": {

                "usage": total_usage,

                "notes": notes_count,

                "quizzes": quiz_count,

                "overall_progress": overall_progress,

                "highest_progress": highest_progress,

                "graph": graph

            }

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }),500