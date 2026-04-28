# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
# Enable CORS so our frontend Javascript (running on a different port or file://) can talk to this API
CORS(app)

# Security key used to sign the JWT tokens. Do not share this!
app.config['SECRET_KEY'] = 'my_super_secret_python_key_123'

# Helper function to connect to MySQL database
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='i3f7ceze', # Default XAMPP has no password
            database='food_donation_db'
        )
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# --- Custom Decorator for Authentication ---
# This is a cool Python feature that lets us "protect" certain routes.
# If a function has @token_required above it, Python runs this check first!
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if the Authorization header was sent by the frontend
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Access denied. Missing token.'}), 401

        try:
            # Decode the token using our secret key
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Pass the decoded user info to the actual function
            current_user = data
        except Exception as e:
            return jsonify({'message': 'Access denied. Invalid or expired token.'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated


# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    # Grab the JSON data sent from the browser
    data = request.get_json()

    if not data or not all(k in data for k in ('name', 'email', 'password', 'role')):
        return jsonify({'message': 'Unable to register. Incomplete data.'}), 400

    if data['role'] not in ['donor', 'ngo', 'admin']:
        return jsonify({'message': 'Invalid role.'}), 400

    db = get_db_connection()
    if not db:
        return jsonify({'message': 'Database error.'}), 500

    cursor = db.cursor(dictionary=True)

    # Check if email is already used
    cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
    if cursor.fetchone():
        db.close()
        return jsonify({'message': 'Email already exists.'}), 400

    # Secure the password by hashing it
    hashed_password = generate_password_hash(data['password'])

    # Insert new user into database
    query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (data['name'], data['email'], hashed_password, data['role']))
    db.commit()
    db.close()

    return jsonify({'message': 'User was successfully registered.'}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Login failed. Incomplete data.'}), 400

    db = get_db_connection()
    if not db:
        return jsonify({'message': 'Database error.'}), 500

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name, password, role FROM users WHERE email = %s", (data['email'],))
    user = cursor.fetchone()
    db.close()

    # Check if user exists and password matches the hashed version
    if user and check_password_hash(user['password'], data['password']):
        
        # Create the Token Payload
        payload = {
            'user_id': user['id'],
            'name': user['name'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1) # Expires in 24 hours
        }

        # Generate the secure Token
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'message': 'Successful login.',
            'jwt': token,
            'role': user['role'],
            'name': user['name']
        }), 200

    return jsonify({'message': 'Login failed. Incorrect credentials.'}), 401


# ==========================================
# DONATIONS ROUTES
# ==========================================

@app.route('/api/donations/create', methods=['POST'])
@token_required
def create_donation(current_user):
    # Only donors can post food
    if current_user['role'] != 'donor':
        return jsonify({'message': 'Only donors can create donations.'}), 403

    data = request.get_json()
    if not data or not all(k in data for k in ('food_type', 'quantity', 'location', 'expiry_time')):
        return jsonify({'message': 'Incomplete data.'}), 400

    db = get_db_connection()
    cursor = db.cursor()
    query = """
        INSERT INTO donations (donor_id, food_type, quantity, location, expiry_time) 
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(query, (
        current_user['user_id'],
        data['food_type'],
        data['quantity'],
        data['location'],
        data['expiry_time']
    ))
    db.commit()
    db.close()

    return jsonify({'message': 'Food donation was created successfully.'}), 201


@app.route('/api/donations/list', methods=['GET'])
@token_required
def list_donations(current_user):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    role = current_user['role']
    user_id = current_user['user_id']

    if role == 'donor':
        # Donors see their own food only
        query = """
            SELECT d.*, u.name as ngo_name 
            FROM donations d 
            LEFT JOIN users u ON d.assigned_ngo_id = u.id 
            WHERE d.donor_id = %s 
            ORDER BY d.created_at DESC
        """
        cursor.execute(query, (user_id,))
    
    elif role == 'ngo':
        # NGO tab filtering
        filter_type = request.args.get('filter', 'pending')
        
        if filter_type == 'my_tasks':
            # Their accepted tasks
            query = """
                SELECT d.*, u.name as donor_name 
                FROM donations d 
                JOIN users u ON d.donor_id = u.id 
                WHERE d.assigned_ngo_id = %s 
                ORDER BY d.created_at DESC
            """
            cursor.execute(query, (user_id,))
        else:
            # All available globally
            query = """
                SELECT d.*, u.name as donor_name 
                FROM donations d 
                JOIN users u ON d.donor_id = u.id 
                WHERE d.status = 'pending' 
                ORDER BY d.created_at DESC
            """
            cursor.execute(query)
            
    elif role == 'admin':
        # Admins see everything
        query = """
            SELECT d.*, d_user.name as donor_name, ngo_user.name as ngo_name 
            FROM donations d 
            JOIN users d_user ON d.donor_id = d_user.id 
            LEFT JOIN users ngo_user ON d.assigned_ngo_id = ngo_user.id 
            ORDER BY d.created_at DESC
        """
        cursor.execute(query)

    records = cursor.fetchall()
    db.close()
    
    # We must format datetime objects to strings before converting to JSON!
    for record in records:
        if 'created_at' in record and record['created_at']:
            record['created_at'] = record['created_at'].isoformat()
        if 'expiry_time' in record and record['expiry_time']:
            record['expiry_time'] = record['expiry_time'].isoformat()

    return jsonify({"records": records}), 200


@app.route('/api/donations/update_status', methods=['POST'])
@token_required
def update_status(current_user):
    data = request.get_json()

    if not data or not data.get('donation_id') or not data.get('status'):
        return jsonify({'message': 'Incomplete data.'}), 400

    donation_id = data['donation_id']
    new_status = data['status'].lower()
    
    if new_status not in ['pending', 'accepted', 'completed', 'rejected']:
        return jsonify({'message': 'Invalid status.'}), 400

    db = get_db_connection()
    cursor = db.cursor()

    if current_user['role'] == 'ngo':
        if new_status == 'accepted':
            # Only claim if it's currently pending
            cursor.execute(
                "UPDATE donations SET status = %s, assigned_ngo_id = %s WHERE id = %s AND status = 'pending'",
                (new_status, current_user['user_id'], donation_id)
            )
        elif new_status in ['completed', 'rejected']:
            # Only finish if they own the delivery task
            cursor.execute(
                "UPDATE donations SET status = %s WHERE id = %s AND assigned_ngo_id = %s",
                (new_status, donation_id, current_user['user_id'])
            )
        else:
            db.close()
            return jsonify({'message': 'Invalid NGO transition.'}), 400

    elif current_user['role'] == 'admin':
        cursor.execute(
            "UPDATE donations SET status = %s WHERE id = %s",
            (new_status, donation_id)
        )
    else:
        db.close()
        return jsonify({'message': 'Donors cannot change statuses.'}), 403

    db.commit()
    rows_affected = cursor.rowcount
    db.close()

    if rows_affected > 0:
        return jsonify({'message': 'Status successfully updated.'}), 200
    else:
        return jsonify({'message': 'Donation not found or permission denied.'}), 404


# ==========================================
# ADMIN ROUTES
# ==========================================

@app.route('/api/admin/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only.'}), 403

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) as total FROM users")
    total_users = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM donations")
    total_donations = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as total FROM donations WHERE status = 'completed'")
    total_completed = cursor.fetchone()['total']

    db.close()
    return jsonify({
        "total_users": total_users,
        "total_donations": total_donations,
        "total_completed": total_completed
    }), 200


@app.route('/api/admin/users', methods=['GET'])
@token_required
def list_users(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only.'}), 403

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
    records = cursor.fetchall()
    db.close()

    for r in records:
        if r['created_at']:
            r['created_at'] = r['created_at'].isoformat()

    return jsonify({"records": records}), 200

# Start the Flask server
if __name__ == '__main__':
    print("Starting Flask API Server for Food Connection...")
    # debug=True automatically reloads the server if we save changes!
    app.run(debug=True, port=5000)
