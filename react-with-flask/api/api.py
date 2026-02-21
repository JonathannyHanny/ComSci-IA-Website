# Flask API - handles activities, signups, auth, recommendations

import os
import time
from flask import Flask, send_from_directory, jsonify, request
from werkzeug.security import check_password_hash
from mysql_utils import (
    get_all_activities, create_user, get_user_by_email, create_activity,
    signup_for_activity, delete_activity, get_user_activity_ids, remove_signup_for_activity,
    get_all_users, make_user_admin, is_user_admin, DatabaseUnavailableError
)
from recommendations.content_based import ContentBasedRecommender
from recommendations.collaborative_filtering import CollaborativeFilteringRecommender
from recommendations.reverse_content_based import ReverseContentBasedRecommender
from mysql_utils import get_all_user_activities_map


app = Flask(__name__, static_folder="dist", static_url_path="")


def _handle_api_error(error):
    if isinstance(error, DatabaseUnavailableError):
        return jsonify({'error': str(error)}), 503
    return jsonify({'error': str(error)}), 500

 
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    # serve React app
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
        return _handle_api_error(e)


@app.route('/api/recommendations/user/<int:user_id>', methods=['GET'])
def recommend_for_user(user_id):
    # Returns JSON with separate lists for each recommendation strategy
    try:
        # Fetch all activities from database with their tags and competencies
        activities = get_all_activities()

        # Formats activities
        activity_dicts = [
            {
                'id': act['activity_id'],
                'name': act.get('name', ''),
                'tags': act.get('tags', []),
                'competencies': act.get('competencies', [])
            }
            for act in activities
        ]

        # Get the list of activity IDs the user is currently signed up for
        user_activity_ids = get_user_activity_ids(user_id) or []

        # Algorithm 1: Content-based filtering using Jaccard similarity
        content_rec = []
        if user_activity_ids:
            # Content-based recommender with all activities
            cbr = ContentBasedRecommender(activity_dicts)
            # Get recommendations based on user's current activities
            content_rec = cbr.recommend_for_user(user_activity_ids, top_n=6)
            # Map back to original activity format from database
            id_map_act = {a['activity_id']: a for a in activities}
            content_rec = [id_map_act.get(act['id']) for act in content_rec if id_map_act.get(act['id'])]

        # Algorithm 2: Collaborative filtering using cosine similarity on user overlap
        collaborative_rec = []
        try:
            # Get mapping of all users to their activity signups
            all_user_map = get_all_user_activities_map()
            # Instantiate collaborative recommender with user-activity relationships
            cfr = CollaborativeFilteringRecommender(all_user_map, activity_dicts)
            # Get recommendations based on similar users' preferences
            collaborative_items = cfr.recommend_for_user(user_id, top_n=6)
            # Map back to original activity format
            id_map_act = {a['activity_id']: a for a in activities}
            collaborative_rec = [id_map_act.get(act['id']) for act in collaborative_items if id_map_act.get(act['id'])]
        except Exception:
            # Fallback: if collaborative fails (e.g., new user with no peers), return empty list
            collaborative_rec = []

        # Algorithm 3: Reverse content-based using inverted Jaccard similarity
        reverse_rec = []
        if user_activity_ids:
            # Instantiate reverse recommender (polymorphic with content-based)
            rcbr = ReverseContentBasedRecommender(activity_dicts)
            # Get diverse recommendations (high dissimilarity = high score)
            reverse_items = rcbr.recommend_for_user(user_activity_ids, top_n=6)
            # Map back to original activity format
            id_map_act = {a['activity_id']: a for a in activities}
            reverse_rec = [id_map_act.get(act['id']) for act in reverse_items if id_map_act.get(act['id'])]

        # Scores activities by how frequently their tags appear across all activities
        top_picks = []
        try:
            from collections import Counter

            # Count how many times each tag appears across all activities
            tag_counter = Counter()
            for act in activity_dicts:
                tag_counter.update(act.get('tags', []))
            
            # Score each activity by summing the frequencies of its tags
            activity_scores = []
            for act in activity_dicts:
                score = sum(tag_counter.get(t, 0) for t in act.get('tags', []))
                activity_scores.append((act['id'], score))
            
            # Sort by score descending (highest tag frequency first)
            activity_scores.sort(key=lambda p: p[1], reverse=True)
            # Map top 6 scored activities back to original format
            id_map_act = {a['activity_id']: a for a in activities}
            top_picks = [id_map_act[act_id] for act_id, _ in activity_scores[:6] if act_id in id_map_act]
        except Exception:
            # Fallback: if tag scoring fails, just return first 6 activities
            top_picks = activities[:6]

        # Return all four recommendation lists in JSON response
        return jsonify({
            'top_picks': top_picks,
            'content': content_rec,
            'collaborative': collaborative_rec,
            'reverse': reverse_rec
        }), 200
    except Exception as e:
        return _handle_api_error(e)

@app.route('/api/activities', methods=['POST'])
def create_activity_api():
    """Admin creates a new activity with tags/competencies."""
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
        return _handle_api_error(e)

@app.route('/api/activities/<int:activity_id>/signup', methods=['POST'])
def signup_activity(activity_id):
    """Sign a user up for an activity (expects JSON {user_id})."""
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    try:
        signup_for_activity(user_id, activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return _handle_api_error(e)


@app.route('/api/activities/<int:activity_id>/signup', methods=['DELETE'])
def unsign_activity(activity_id):
    """Remove a user's signup. Accepts JSON body or ?user_id= query param."""
    data = request.get_json() or {}
    user_id = data.get('user_id') or request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    try:
        remove_signup_for_activity(int(user_id), activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return _handle_api_error(e)

@app.route('/api/activities/<int:activity_id>', methods=['DELETE'])
def delete_activity_api(activity_id):
    """Delete an activity and its related rows (signups, tags, competencies)."""
    try:
        delete_activity(activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return _handle_api_error(e)

 
@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user; fails if email already exists."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    if not all([email, password, first_name, last_name]):
        return jsonify({'error': 'All fields required'}), 400
    # Register a new user. create_user raises ValueError when email already exists.
    try:
        user_id = create_user(email, password, first_name, last_name)
        return jsonify({'user_id': user_id, 'email': email}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 409
    except Exception:
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Validate credentials and return user profile details."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not all([email, password]):
        return jsonify({'error': 'Email and password required'}), 400
    try:
        user = get_user_by_email(email)
        if user and check_password_hash(user['password_hash'], password):
            return jsonify({
                'user_id': user['user_id'],
                'email': user['email'],
                'first_name': user.get('first_name', ''),
                'last_name': user.get('last_name', ''),
                'is_admin': user.get('is_admin', False)
            }), 200
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return _handle_api_error(e)

 
@app.route('/api/user/<int:user_id>/activities')
def get_user_activities(user_id):
    """Return only the activity ids for a given user (used by dashboard)."""
    try:
        activity_ids = get_user_activity_ids(user_id)
        return jsonify({'activity_ids': activity_ids}), 200
    except Exception as e:
        return _handle_api_error(e)

@app.route('/api/users', methods=['GET'])
def list_users():
    user_id = request.args.get('user_id', type=int)
    try:
        if not user_id or not is_user_admin(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        users = get_all_users()
        return jsonify({'users': users}), 200
    except Exception as e:
        return _handle_api_error(e)

@app.route('/api/user/<int:user_id>/make-admin', methods=['POST'])
def make_user_admin_endpoint(user_id):
    data = request.get_json() or {}
    requester_id = data.get('requester_id')
    try:
        if not requester_id or not is_user_admin(requester_id):
            return jsonify({'error': 'Unauthorized'}), 403
        make_user_admin(user_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return _handle_api_error(e)

 
@app.route('/api/user/<int:user_id>/is-admin', methods=['GET'])
def check_user_admin(user_id):
    try:
        admin = is_user_admin(user_id)
        return jsonify({'is_admin': admin}), 200
    except Exception as e:
        return _handle_api_error(e)

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


