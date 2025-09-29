def get_all_activities():
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT activity_id, name, description FROM activities ORDER BY name ASC")
    activities = cursor.fetchall()
    # Get tags and competencies for each activity
    for act in activities:
        # Tags
        cursor.execute("""
            SELECT t.tag_name FROM tags t
            JOIN activity_tags at ON t.tag_id = at.tag_id
            WHERE at.activity_id = %s
        """, (act['activity_id'],))
        act['tags'] = [row['tag_name'] for row in cursor.fetchall()]
        # Competencies
        cursor.execute("""
            SELECT c.competency_name FROM competencies c
            JOIN activity_competencies ac ON c.competency_id = ac.competency_id
            WHERE ac.activity_id = %s
        """, (act['activity_id'],))
        act['competencies'] = [row['competency_name'] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return activities
import mysql.connector
from werkzeug.security import generate_password_hash

def get_mysql_connection():
    return mysql.connector.connect(
        host="beyondclass.site",
        user="jonathan_Jonathan",
        password="#Jonathan2007",
        database="jonathan_ClassBeyond"
    )

def get_or_create_tag(tag_name, conn, cursor):
    cursor.execute("SELECT tag_id FROM tags WHERE tag_name = %s", (tag_name,))
    row = cursor.fetchone()
    if row:
        return row[0]
    cursor.execute("INSERT INTO tags (tag_name) VALUES (%s)", (tag_name,))
    conn.commit()
    return cursor.lastrowid

def get_or_create_competency(competency_name, conn, cursor):
    cursor.execute("SELECT competency_id FROM competencies WHERE competency_name = %s", (competency_name,))
    row = cursor.fetchone()
    if row:
        return row[0]
    cursor.execute("INSERT INTO competencies (competency_name) VALUES (%s)", (competency_name,))
    conn.commit()
    return cursor.lastrowid

def create_activity(name, description, tags, competencies):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO activities (name, description) VALUES (%s, %s)", (name, description))
    activity_id = cursor.lastrowid
    
    for tag in tags:
        tag_id = get_or_create_tag(tag.strip(), conn, cursor)
        cursor.execute("INSERT IGNORE INTO activity_tags (activity_id, tag_id) VALUES (%s, %s)", (activity_id, tag_id))

    for comp in competencies:
        comp_id = get_or_create_competency(comp.strip(), conn, cursor)
        cursor.execute("INSERT IGNORE INTO activity_competencies (activity_id, competency_id) VALUES (%s, %s)", (activity_id, comp_id))
    conn.commit()
    cursor.close()
    conn.close()
    return activity_id

def create_user(email, password, first_name, last_name):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise ValueError("Email already registered")
    cursor.execute(
        "INSERT INTO users (email, first_name, last_name) VALUES (%s, %s, %s)",
        (email, first_name, last_name)
    )
    user_id = cursor.lastrowid
    password_hash = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO user_auth (user_id, password_hash) VALUES (%s, %s)",
        (user_id, password_hash)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return user_id

def get_user_by_email(email):
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT u.user_id, u.email, ua.password_hash, u.first_name, u.last_name "
        "FROM users u JOIN user_auth ua ON u.user_id = ua.user_id WHERE u.email = %s",
        (email,)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user
