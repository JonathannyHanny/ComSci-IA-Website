 
import os
import time
from flask import Flask, send_from_directory, jsonify, request
from werkzeug.security import check_password_hash
from mysql_utils import (
    get_all_activities, create_user, get_user_by_email, create_activity,
    signup_for_activity, delete_activity, get_user_activity_ids
)

 
app = Flask(__name__, static_folder="dist", static_url_path="")

 
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

 
@app.route('/api/activities', methods=['GET'])
def list_activities():
    try:
        activities = get_all_activities()
        return jsonify({'activities': activities}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities', methods=['POST'])
def create_activity_api():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    tags = data.get('tags', [])
    competencies = data.get('competencies', [])
    if not name:
        return jsonify({'error': 'Activity name required'}), 400
    try:
        activity_id = create_activity(name, description, tags, competencies)
        return jsonify({'activity_id': activity_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities/<int:activity_id>/signup', methods=['POST'])
def signup_activity(activity_id):
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    try:
        signup_for_activity(user_id, activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities/<int:activity_id>', methods=['DELETE'])
def delete_activity_api(activity_id):
    try:
        delete_activity(activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

 
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
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            'user_id': user['user_id'],
            'email': user['email'],
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', '')
        }), 200
    return jsonify({'error': 'Invalid credentials'}), 401

 
@app.route('/api/user/<int:user_id>/activities')
def get_user_activities(user_id):
    try:
        activity_ids = get_user_activity_ids(user_id)
        return jsonify({'activity_ids': activity_ids}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

 
@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

