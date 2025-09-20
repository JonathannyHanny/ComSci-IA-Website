

def get_mysql_connection():
    return mysql.connector.connect(
        host="beyondclass.site",     
        user="jonathan_Jonathan",          
        password="#Jonathan2007",   
        database="jonathan_ClassBeyond" 
    )
def create_user(email, password, first_name, last_name):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    # Check if email already exists
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        raise ValueError("Email already registered")
    # Insert new user
    cursor.execute("""
        INSERT INTO users (email, first_name, last_name)
        VALUES (%s, %s, %s)
    """, (email, first_name, last_name))
    user_id = cursor.lastrowid
    password_hash = generate_password_hash(password)
    cursor.execute("""
        INSERT INTO user_auth (user_id, password_hash)
        VALUES (%s, %s)
    """, (user_id, password_hash))
    conn.commit()
    cursor.close()
    conn.close()
    return user_id
def get_user_by_email(email):
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.user_id, u.email, ua.password_hash, u.first_name, u.last_name
        FROM users u
        JOIN user_auth ua ON u.user_id = ua.user_id
        WHERE u.email = %s
    """, (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user
import mysql.connector
from werkzeug.security import generate_password_hash

def get_mysql_connection():
    return mysql.connector.connect(
        host="beyondclass.site",
        user="jonathan_Jonathan",
        password="#Jonathan2007",
        database="jonathan_ClassBeyond"
    )

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
