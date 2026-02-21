 
# MySQL helper functions - all DB operations go here

import os

import mysql.connector
from mysql.connector import Error as MySQLError
from werkzeug.security import generate_password_hash


class DatabaseUnavailableError(RuntimeError):
    # Raised when the database connection cannot be established.
    pass


def get_mysql_connection():
    # Pull DB credentials from environment variables, fallback to defaults if not set
    host = os.getenv("DB_HOST", "beyondclass.site")
    user = os.getenv("DB_USER", "jonathan_Jonathan")
    password = os.getenv("DB_PASSWORD", "#Jonathan2007")
    database = os.getenv("DB_NAME", "jonathan_ClassBeyond")
    port = int(os.getenv("DB_PORT", "3306"))

    try:
        # Attempt connection with 5 second timeout to avoid hanging
        return mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            connection_timeout=5
        )
    except MySQLError as exc:
        # Wrap mysql errors in our custom exception for cleaner error handling
        raise DatabaseUnavailableError(
            "Database connection failed. Check DB_HOST/DB_USER/DB_PASSWORD/DB_NAME and that the server is reachable."
        ) from exc


# get activities a user signed up for
def get_user_activity_ids(user_id):
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT activity_id FROM user_activities WHERE user_id = %s", (user_id,))
            rows = cursor.fetchall()
    # Extract just the activity IDs from the result tuples
    return [row[0] for row in rows]


# add signup
def signup_for_activity(user_id, activity_id):
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            # INSERT IGNORE prevents errors if the user already signed up for this activity
            cursor.execute(
                "INSERT IGNORE INTO user_activities (user_id, activity_id) VALUES (%s, %s)",
                (user_id, activity_id)
            )
            conn.commit()
    return True


# remove signup
def remove_signup_for_activity(user_id, activity_id):
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM user_activities WHERE user_id = %s AND activity_id = %s", (user_id, activity_id))
            conn.commit()
    return True


# delete activity and cleanup
def delete_activity(activity_id):
    # Delete an activity and all related rows.
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            # Clean up related tables first to maintain referential integrity
            cursor.execute("DELETE FROM user_activities WHERE activity_id = %s", (activity_id,))
            cursor.execute("DELETE FROM activity_tags WHERE activity_id = %s", (activity_id,))
            cursor.execute("DELETE FROM activity_competencies WHERE activity_id = %s", (activity_id,))
            # Finally delete the activity itself
            cursor.execute("DELETE FROM activities WHERE activity_id = %s", (activity_id,))
            conn.commit()
    return True


# get all activities with tags/competencies
def get_all_activities():
    with get_mysql_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            # Fetch all activities first, alphabetically 
            cursor.execute("SELECT activity_id, name, description FROM activities ORDER BY name ASC")
            activities = cursor.fetchall()
            
            # Initialize empty lists for tags and competencies on each activity
            for act in activities:
                act['tags'] = []
                act['competencies'] = []
            
            # Build a  lookup map
            activity_map = {act['activity_id']: act for act in activities}
            
            # Fetch ALL activity-tag relationships
            cursor.execute(
                """
                SELECT at.activity_id, t.tag_name 
                FROM activity_tags at
                JOIN tags t ON at.tag_id = t.tag_id
                ORDER BY at.activity_id
                """
            )
            # Group tags by activity_id
            for row in cursor.fetchall():
                if row['activity_id'] in activity_map:
                    activity_map[row['activity_id']]['tags'].append(row['tag_name'])
            
            # Fetch ALL activity-competency relationships
            cursor.execute(
                """
                SELECT ac.activity_id, c.competency_name
                FROM activity_competencies ac
                JOIN competencies c ON ac.competency_id = c.competency_id
                ORDER BY ac.activity_id
                """
            )
            # Group competencies by activity_id
            for row in cursor.fetchall():
                if row['activity_id'] in activity_map:
                    activity_map[row['activity_id']]['competencies'].append(row['competency_name'])
    
    return activities


# build user -> activities map
def get_all_user_activities_map():
    # Returns dict mapping user_id to list of activity_ids they're signed up for.
    user_map = {}
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id, activity_id FROM user_activities")
            rows = cursor.fetchall()
            for user_id, activity_id in rows:
                # setdefault creates empty list if user not in map yet
                user_map.setdefault(user_id, []).append(activity_id)
    return user_map


# get or create tag
def get_or_create_tag(tag_name, conn, cursor):
    # Finds existing tag or creates new one, returns tag_id either way.
    cursor.execute("SELECT tag_id FROM tags WHERE tag_name = %s", (tag_name,))
    row = cursor.fetchone()
    if row:
        # Tag already exists, just return its ID
        return row[0]
    # Tag doesn't exist, create it
    cursor.execute("INSERT INTO tags (tag_name) VALUES (%s)", (tag_name,))
    conn.commit()
    return cursor.lastrowid


# get or create competency
def get_or_create_competency(competency_name, conn, cursor):
    # Finds existing competency or creates new one, returns competency_id either way.
    cursor.execute("SELECT competency_id FROM competencies WHERE competency_name = %s", (competency_name,))
    row = cursor.fetchone()
    if row:
        # Competency already exists, just return its ID
        return row[0]
    # Competency doesn't exist, create it
    cursor.execute("INSERT INTO competencies (competency_name) VALUES (%s)", (competency_name,))
    conn.commit()
    return cursor.lastrowid


# create new activity with tags/competencies
def create_activity(name, description, tags, competencies):
    # Creates a new activity and associates it with the given tags and competencies.
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            # First create the base activity record
            cursor.execute("INSERT INTO activities (name, description) VALUES (%s, %s)", (name, description))
            activity_id = cursor.lastrowid
            # Link the activity to its tags
            for tag in tags:
                tag_id = get_or_create_tag(tag.strip(), conn, cursor)
                cursor.execute("INSERT IGNORE INTO activity_tags (activity_id, tag_id) VALUES (%s, %s)", (activity_id, tag_id))
            # Link the activity to its competencies
            for comp in competencies:
                comp_id = get_or_create_competency(comp.strip(), conn, cursor)
                cursor.execute("INSERT IGNORE INTO activity_competencies (activity_id, competency_id) VALUES (%s, %s)", (activity_id, comp_id))
            conn.commit()
    return activity_id


# create user with auth
def create_user(email, password, first_name, last_name):
    # Creates a new user account with hashed password. Raises ValueError if email exists.
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            # Check if email is already taken
            cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                raise ValueError("Email already registered")
            # Create the user record
            cursor.execute(
                "INSERT INTO users (email, first_name, last_name) VALUES (%s, %s, %s)",
                (email, first_name, last_name)
            )
            user_id = cursor.lastrowid
            # Hash the password and store in separate auth table
            password_hash = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO user_auth (user_id, password_hash) VALUES (%s, %s)",
                (user_id, password_hash)
            )
            conn.commit()
    return user_id


# get user by email (includes password hash and admin flag)
def get_user_by_email(email):
    # Fetches user record by email, including password hash for authentication.
    with get_mysql_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            # Join users with auth table to get password hash
            cursor.execute(
                "SELECT u.user_id, u.email, ua.password_hash, u.first_name, u.last_name, u.is_admin "
                "FROM users u JOIN user_auth ua ON u.user_id = ua.user_id WHERE u.email = %s",
                (email,)
            )
            user = cursor.fetchone()
            if user:
                # Convert tinyint is_admin to proper boolean
                user['is_admin'] = bool(user['is_admin'])
    return user


# get all users
def get_all_users():
    # Returns list of all users
    with get_mysql_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT user_id, email, first_name, last_name, is_admin FROM users")
            users = cursor.fetchall()
            # Convert is_admin from tinyint to boolean for each user
            for user in users:
                user['is_admin'] = bool(user['is_admin'])
    return users


# promote user to admin
def make_user_admin(user_id):
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE users SET is_admin = TRUE WHERE user_id = %s", (user_id,))
            conn.commit()
    return True


# check if user is admin
def is_user_admin(user_id):
    # Returns True if user has admin privileges, False otherwise.
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (user_id,))
            row = cursor.fetchone()
            # Return False if user doesn't exist, otherwise return admin status
            return bool(row[0]) if row else False
