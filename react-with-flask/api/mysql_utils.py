 
def get_user_activity_ids(user_id):
    
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT activity_id FROM user_activities WHERE user_id = %s", (user_id,))
            rows = cursor.fetchall()
    return [row[0] for row in rows]


 
import mysql.connector
from werkzeug.security import generate_password_hash

 
def get_mysql_connection():
    
    return mysql.connector.connect(
        host="beyondclass.site",
        user="jonathan_Jonathan",
        password="#Jonathan2007",
        database="jonathan_ClassBeyond"
    )

 
def signup_for_activity(user_id, activity_id):
    
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT IGNORE INTO user_activities (user_id, activity_id) VALUES (%s, %s)",
                (user_id, activity_id)
            )
            conn.commit()
    return True

def delete_activity(activity_id):
    
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM user_activities WHERE activity_id = %s", (activity_id,))
            cursor.execute("DELETE FROM activity_tags WHERE activity_id = %s", (activity_id,))
            cursor.execute("DELETE FROM activity_competencies WHERE activity_id = %s", (activity_id,))
            cursor.execute("DELETE FROM activities WHERE activity_id = %s", (activity_id,))
            conn.commit()
    return True

def get_all_activities():
    
    with get_mysql_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT activity_id, name, description FROM activities ORDER BY name ASC")
            activities = cursor.fetchall()
            for act in activities:
                
                cursor.execute(
                    """
                    SELECT t.tag_name FROM tags t
                    JOIN activity_tags at ON t.tag_id = at.tag_id
                    WHERE at.activity_id = %s
                    """, (act['activity_id'],)
                )
                act['tags'] = [row['tag_name'] for row in cursor.fetchall()]
                
                cursor.execute(
                    """
                    SELECT c.competency_name FROM competencies c
                    JOIN activity_competencies ac ON c.competency_id = ac.competency_id
                    WHERE ac.activity_id = %s
                    """, (act['activity_id'],)
                )
                act['competencies'] = [row['competency_name'] for row in cursor.fetchall()]
    return activities

 
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
    
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO activities (name, description) VALUES (%s, %s)", (name, description))
            activity_id = cursor.lastrowid
            for tag in tags:
                tag_id = get_or_create_tag(tag.strip(), conn, cursor)
                cursor.execute("INSERT IGNORE INTO activity_tags (activity_id, tag_id) VALUES (%s, %s)", (activity_id, tag_id))
            for comp in competencies:
                comp_id = get_or_create_competency(comp.strip(), conn, cursor)
                cursor.execute("INSERT IGNORE INTO activity_competencies (activity_id, competency_id) VALUES (%s, %s)", (activity_id, comp_id))
            conn.commit()
    return activity_id

 
def create_user(email, password, first_name, last_name):
    
    with get_mysql_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
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
    return user_id

def get_user_by_email(email):
    
    with get_mysql_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT u.user_id, u.email, ua.password_hash, u.first_name, u.last_name "
                "FROM users u JOIN user_auth ua ON u.user_id = ua.user_id WHERE u.email = %s",
                (email,)
            )
            user = cursor.fetchone()
    return user
