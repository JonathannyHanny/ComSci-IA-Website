
from flask import Flask, send_from_directory, jsonify, request
from mysql_utils import create_user, get_user_by_email
import os
import time

app = Flask(__name__, static_folder="dist", static_url_path="")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    if not all([email, password, first_name, last_name]):
        return jsonify({'error': 'All fields required'}), 400
    try:
        user_id = create_user(email, password, first_name, last_name)
        return jsonify({'user_id': user_id, 'email': email}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 409
    except Exception:
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not all([email, password]):
        return jsonify({'error': 'Email and password required'}), 400
    user = get_user_by_email(email)

    print("DEBUG user from get_user_by_email:", user) #remember to remove later stupid dumb stupid idiot dumb stupid

    from werkzeug.security import check_password_hash
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            'user_id': user['user_id'],
            'email': user['email'],
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', '')
        }), 200
    return jsonify({'error': 'Invalid credentials'}), 401

