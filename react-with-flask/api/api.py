import time
from flask import Flask

from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder="dist", static_url_path="")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}