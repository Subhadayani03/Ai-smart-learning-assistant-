import os
import json
import tempfile
import firebase_admin
from firebase_admin import credentials, firestore

firebase_data = json.loads(os.environ["FIREBASE_KEY"])

with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as temp:
    json.dump(firebase_data, temp)
    temp.flush()

    cred = credentials.Certificate(temp.name)

firebase_admin.initialize_app(cred)

db = firestore.client()