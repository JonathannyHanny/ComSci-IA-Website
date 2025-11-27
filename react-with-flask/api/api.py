 
import os
import time
from flask import Flask, send_from_directory, jsonify, request
from werkzeug.security import check_password_hash
from mysql_utils import (
    get_all_activities, create_user, get_user_by_email, create_activity,
    signup_for_activity, delete_activity, get_user_activity_ids, remove_signup_for_activity
)

 
app = Flask(__name__, static_folder="dist", static_url_path="")

 
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    # Serve built static files for the front-end single-page app.
    # When a known file path exists in `dist` we return it, otherwise
    # fall back to the SPA entrypoint (index.html) for client-side routing.
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

 
@app.route('/api/activities', methods=['GET'])
def list_activities():
    # Return a JSON list of activities. Uses get_all_activities helper.
    try:
        activities = get_all_activities()
        return jsonify({'activities': activities}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities', methods=['POST'])
def create_activity_api():
    # Create a new activity. Expects JSON payload with {name, description?, tags?, competencies?}
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
    # Sign the provided user up for the activity identified by activity_id.
    # The endpoint expects a JSON body with {user_id: int}.
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    try:
        signup_for_activity(user_id, activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/activities/<int:activity_id>/signup', methods=['DELETE'])
def unsign_activity(activity_id):
    # Unregister a user from an activity. Accepts JSON body or ?user_id= query param.
    data = request.get_json() or {}
    user_id = data.get('user_id') or request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    try:
        remove_signup_for_activity(int(user_id), activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities/<int:activity_id>', methods=['DELETE'])
def delete_activity_api(activity_id):
    # Delete an activity and its related rows (user signups, tags, competencies).
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
    # Register a new user. create_user raises ValueError when email already exists.
    try:
        user_id = create_user
        
        
        (email, password, first_name, last_name)
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
    # Lookup the user and verify password hash.
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
    # Return a list of activity ids that the specified user has signed up to.
    try:
        activity_ids = get_user_activity_ids(user_id)
        return jsonify({'activity_ids': activity_ids}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

 
@app.route('/api/time')
def get_current_time():
    # Simple diagnostic endpoint used by the front-end during development
    return {'time': time.time()}

