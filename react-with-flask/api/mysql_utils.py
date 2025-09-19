
import mysql.connector

def get_mysql_connection():
    return mysql.connector.connect(
        host="beyondclass.site",     
        user="jonathan_Jonathan",          
        password="#Jonathan2007",   
        database="jonathan_ClassBeyond" 
    )

def create_user(email, password):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (email, password)
        VALUES (%s, %s)
    """, (email, password))
    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return user_id

def get_user_by_email(email):
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id, email, password FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user
