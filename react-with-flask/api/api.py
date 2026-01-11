# Flask API - handles activities, signups, auth, recommendations

import os
import time
from flask import Flask, send_from_directory, jsonify, request
from werkzeug.security import check_password_hash
from mysql_utils import (
    get_all_activities, create_user, get_user_by_email, create_activity,
    signup_for_activity, delete_activity, get_user_activity_ids, remove_signup_for_activity,
    get_all_users, make_user_admin, is_user_admin
)
from recommendations.content_based import ContentBasedRecommender
from recommendations.collaborative_filtering import CollaborativeFilteringRecommender
from recommendations.reverse_content_based import ReverseContentBasedRecommender
from mysql_utils import get_all_user_activities_map


app = Flask(__name__, static_folder="dist", static_url_path="")

 
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
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/user/<int:user_id>', methods=['GET'])
def recommend_for_user(user_id):
    # build recommendations using 4 systems
    try:
        activities = get_all_activities()

        items = [
            {
                'id': act['activity_id'],
                'name': act.get('name', ''),
                'tags': act.get('tags', []),
                'competencies': act.get('competencies', [])
            }
            for act in activities
        ]

        user_item_ids = get_user_activity_ids(user_id) or []

        # Content-based: find similar items to what the user already has
        content_rec = []
        if user_item_ids:
            cbr = ContentBasedRecommender(items)
            content_rec = cbr.recommend_for_user(user_item_ids, top_n=6)
            id_map_act = {a['activity_id']: a for a in activities}
            content_rec = [id_map_act.get(it['id']) for it in content_rec if id_map_act.get(it['id'])]

        # Collaborative: look at users with overlapping signups and suggest what they liked
        collaborative_rec = []
        try:
            all_user_map = get_all_user_activities_map()
            cfr = CollaborativeFilteringRecommender(all_user_map, items)
            collaborative_items = cfr.recommend_for_user(user_id, top_n=6)
            id_map_act = {a['activity_id']: a for a in activities}
            collaborative_rec = [id_map_act.get(it['id']) for it in collaborative_items if id_map_act.get(it['id'])]
        except Exception:
            collaborative_rec = []

        # Reverse content-based: suggest items that share tags but feel different
        reverse_rec = []
        if user_item_ids:
            rcbr = ReverseContentBasedRecommender(items)
            reverse_items = rcbr.recommend_for_user(user_item_ids, top_n=6)
            id_map_act = {a['activity_id']: a for a in activities}
            reverse_rec = [id_map_act.get(it['id']) for it in reverse_items if id_map_act.get(it['id'])]

        # Top picks: globally popular based on how often tags appear
        top_picks = []
        try:
            from collections import Counter

            tag_counter = Counter()
            for it in items:
                tag_counter.update(it.get('tags', []))
            item_scores = []
            for it in items:
                score = sum(tag_counter.get(t, 0) for t in it.get('tags', []))
                item_scores.append((it['id'], score))
            item_scores.sort(key=lambda p: p[1], reverse=True)
            id_map_act = {a['activity_id']: a for a in activities}
            top_picks = [id_map_act[_id] for _id, _ in item_scores[:6] if _id in id_map_act]
        except Exception:
            top_picks = activities[:6]

        return jsonify({
            'top_picks': top_picks,
            'content': content_rec,
            'collaborative': collaborative_rec,
            'reverse': reverse_rec
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        return jsonify({'error': str(e)}), 500

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
        return jsonify({'error': str(e)}), 500


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
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities/<int:activity_id>', methods=['DELETE'])
def delete_activity_api(activity_id):
    """Delete an activity and its related rows (signups, tags, competencies)."""
    try:
        delete_activity(activity_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

 
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

 
@app.route('/api/user/<int:user_id>/activities')
def get_user_activities(user_id):
    """Return only the activity ids for a given user (used by dashboard)."""
    try:
        activity_ids = get_user_activity_ids(user_id)
        return jsonify({'activity_ids': activity_ids}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['GET'])
def list_users():
    from mysql_utils import is_user_admin
    user_id = request.args.get('user_id', type=int)
    if not user_id or not is_user_admin(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    try:
        from mysql_utils import get_all_users
        users = get_all_users()
        return jsonify({'users': users}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<int:user_id>/make-admin', methods=['POST'])
def make_user_admin_endpoint(user_id):
    from mysql_utils import is_user_admin, make_user_admin
    data = request.get_json() or {}
    requester_id = data.get('requester_id')
    if not requester_id or not is_user_admin(requester_id):
        return jsonify({'error': 'Unauthorized'}), 403
    try:
        make_user_admin(user_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

 
@app.route('/api/user/<int:user_id>/is-admin', methods=['GET'])
def check_user_admin(user_id):
    try:
        admin = is_user_admin(user_id)
        return jsonify({'is_admin': admin}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


