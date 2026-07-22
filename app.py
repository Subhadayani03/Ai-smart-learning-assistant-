from flask import Flask, send_from_directory
from flask_cors import CORS

from routes.auth import auth
from routes.chat import chat
from routes.notes import notes
from routes.quiz import quiz
from routes.progress import progress
from routes.dashboard import dashboard

app = Flask(
    __name__,
    static_folder="frontend",
    static_url_path=""
)

CORS(app)

app.register_blueprint(auth)
app.register_blueprint(chat)
app.register_blueprint(notes)
app.register_blueprint(quiz)
app.register_blueprint(progress)
app.register_blueprint(dashboard)


@app.route("/")
def home():
    return send_from_directory("frontend", "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("frontend", path)


if __name__ == "__main__":
    app.run(debug=True)
