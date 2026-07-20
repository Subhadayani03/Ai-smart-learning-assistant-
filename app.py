from flask import Flask
from flask_cors import CORS

from routes.auth import auth
from routes.chat import chat
from routes.notes import notes
from routes.quiz import quiz
from routes.progress import progress
from routes.dashboard import dashboard

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth)
app.register_blueprint(chat)
app.register_blueprint(notes)
app.register_blueprint(quiz)
app.register_blueprint(progress)
app.register_blueprint(dashboard)

@app.route("/")
def home():
    return {
        "success": True,
        "message": "Smart AI Learning Assistant Backend Running"
    }

if __name__ == "__main__":
    app.run(debug=True)