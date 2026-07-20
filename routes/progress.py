from flask import Blueprint, request, jsonify
from database.firebase import db

progress = Blueprint("progress", __name__)

# ======================================
# SAVE OR UPDATE COURSE PROGRESS
# ======================================

@progress.route("/progress", methods=["POST"])
def save_progress():

    try:

        data = request.get_json()

        email = data.get("email")
        course = data.get("course")
        percentage = int(data.get("percentage"))

        docs = list(
            db.collection("progress")
            .where("email", "==", email)
            .where("course", "==", course)
            .stream()
        )

        if docs:

            docs[0].reference.update({

                "percentage": percentage

            })

        else:

            db.collection("progress").add({

                "email": email,
                "course": course,
                "percentage": percentage

            })

        return jsonify({

            "success": True,
            "message": "Progress Saved"

        })

    except Exception as e:

        return jsonify({

            "success": False,
            "message": str(e)

        }),500


# ======================================
# GET ALL PROGRESS OF LOGGED USER
# ======================================

@progress.route("/progress/<email>", methods=["GET"])
def get_progress(email):

    try:

        docs = list(

            db.collection("progress")
            .where("email", "==", email)
            .stream()

        )

        progress_list = []

        total = 0

        for doc in docs:

            item = doc.to_dict()

            progress_list.append(item)

            total += int(item.get("percentage",0))

        overall = 0

        if len(progress_list) > 0:

            overall = round(total / len(progress_list))

        return jsonify({

            "success": True,

            "overall": overall,

            "progress": progress_list

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }),500