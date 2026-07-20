from flask import Blueprint, request, jsonify
from database.firebase import db

auth = Blueprint("auth", __name__)

# ---------------- REGISTER ----------------
@auth.route("/register", methods=["POST"])
def register():

    try:

        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:

            return jsonify({
                "success": False,
                "message": "All fields are required."
            }), 400

        # Check if email already exists
        users = db.collection("users").where("email", "==", email).stream()

        for user in users:
            return jsonify({
                "success": False,
                "message": "Email already registered."
            }), 400

        db.collection("users").add({
            "name": name,
            "email": email,
            "password": password
        })

        return jsonify({
            "success": True,
            "message": "Registration Successful"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ---------------- LOGIN ----------------
@auth.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        users = db.collection("users").where("email", "==", email).stream()

        for user in users:

            user_data = user.to_dict()

            if user_data["password"] == password:

                return jsonify({
                    "success": True,
                    "message": "Login Successful",
                    "user": {
                        "name": user_data["name"],
                        "email": user_data["email"]
                    }
                })

        return jsonify({
            "success": False,
            "message": "Invalid Email or Password"
        }), 401

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ---------------- FORGOT PASSWORD ----------------
@auth.route("/forgot-password", methods=["POST"])
def forgot_password():

    try:

        data = request.get_json()

        email = data.get("email")
        new_password = data.get("new_password")

        users = db.collection("users").where("email", "==", email).stream()

        for user in users:

            user.reference.update({
                "password": new_password
            })

            return jsonify({
                "success": True,
                "message": "Password Updated Successfully"
            })

        return jsonify({
            "success": False,
            "message": "Email not found."
        }), 404

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500