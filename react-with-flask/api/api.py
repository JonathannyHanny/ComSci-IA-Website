import os

from mysql_utils import create_user, get_user_by_email
from flask import Flask, send_from_directory, jsonify, request

import time

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


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    try:
        user_id = create_user(email, password)
        return jsonify({'user_id': user_id, 'email': email}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    user = get_user_by_email(email)
    if user and user['password'] == password:
        return jsonify({'user_id': user['user_id'], 'email': user['email']}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

