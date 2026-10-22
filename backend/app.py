from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from geopy.distance import geodesic
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'logistics-secret-key'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory store
# vehicles = {
#     "V-123": {
#         "id": "V-123",
#         "lat": 19.0760,
#         "lng": 72.8777,
#         "last_updated": timestamp,
#         "speed_kmh": 0,
#         "history": [{"lat": 19.0, "lng": 72.8}, ...] # up to 100 points
#     }
# }
vehicles = {}

@app.route('/get_locations', methods=['GET'])
def get_locations():
    return jsonify({"vehicles": list(vehicles.values())})

@app.route('/update_location', methods=['POST'])
def update_location():
    data = request.json
    if not data or 'vehicle_id' not in data or 'lat' not in data or 'lng' not in data:
        return jsonify({"error": "Invalid payload"}), 400

    vid = data['vehicle_id']
    try:
        lat = float(data['lat'])
        lng = float(data['lng'])
    except ValueError:
        return jsonify({"error": "Invalid coordinates"}), 400
        
    current_time = time.time()

    if vid not in vehicles:
        vehicles[vid] = {
            "id": vid,
            "lat": lat,
            "lng": lng,
            "last_updated": current_time,
            "speed_kmh": 0,
            "history": [{"lat": lat, "lng": lng}],
            "color": data.get("color", "#EF4444")
        }
    else:
        v = vehicles[vid]
        prev_lat = v["lat"]
        prev_lng = v["lng"]
        prev_time = v["last_updated"]

        # Calculate distance and speed using Geopy
        distance_km = geodesic((prev_lat, prev_lng), (lat, lng)).kilometers
        time_diff_hours = (current_time - prev_time) / 3600.0

        speed = 0
        # Ignore unrealistic jumps (e.g., initial teleportation in simulation)
        if time_diff_hours > 0 and distance_km < 500:
            speed = distance_km / time_diff_hours

        # Update
        v["lat"] = lat
        v["lng"] = lng
        v["last_updated"] = current_time
        # Smooth out speed display slightly
        v["speed_kmh"] = round((v["speed_kmh"] + speed) / 2 if speed > 0 else 0, 1)
        v["history"].append({"lat": lat, "lng": lng})

        # Keep history bounded
        if len(v["history"]) > 100:
            v["history"].pop(0)

    # Notify clients via WebSocket
    socketio.emit('vehicle_updated', vehicles[vid])

    return jsonify({"status": "success", "vehicle": vehicles[vid]})

@app.route('/clear_locations', methods=['POST'])
def clear_locations():
    vehicles.clear()
    socketio.emit('locations_cleared')
    return jsonify({"status": "cleared"})

import os
import urllib.request
import urllib.parse
import urllib.error
import base64
import json

def load_env():
    try:
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if '=' in line and not line.startswith('#'):
                        key, val = line.split('=', 1)
                        # Remove quotes if present
                        val = val.strip('\'"')
                        os.environ[key.strip()] = val.strip()
    except Exception as e:
        print("Could not load .env file:", e)

@app.route('/send_ticket_notification', methods=['POST'])
def send_ticket_notification():
    load_env() # Ensure latest env vars are loaded from root .env
    
    data = request.json
    if not data or 'ticket' not in data:
        return jsonify({"error": "Invalid payload"}), 400
        
    ticket = data['ticket']
    
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    to_number = os.getenv('TWILIO_TO_NUMBER')
    from_number = os.getenv('TWILIO_FROM_NUMBER')
    use_whatsapp = os.getenv('VITE_TWILIO_USE_WHATSAPP', 'false').lower() == 'true'
    
    if not account_sid or not auth_token or not to_number or not from_number:
        print("Twilio credentials not configured in .env. Skipping SMS notification.")
        return jsonify({"status": "skipped", "reason": "Credentials not set"}), 200

    # Format the message for Twilio
    msg_body = (
        f"🚨 New Support Request!\n\n"
        f"ID: {ticket['id']}\n"
        f"Type: {ticket['type'].upper()}\n"
        f"Priority: {ticket['priority'].upper()}\n"
        f"Description: {ticket['description']}\n"
        f"Location: {ticket.get('location', {}).get('address', 'GPS Verified')}"
    )

    if use_whatsapp:
        final_to = f"whatsapp:{to_number}"
        final_from = f"whatsapp:{from_number}"
    else:
        final_to = to_number
        final_from = from_number

    try:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        
        # Prepare parameters
        post_params = {
            'To': final_to,
            'From': final_from,
            'Body': msg_body
        }
        post_data = urllib.parse.urlencode(post_params).encode('utf-8')
        
        # Basic Auth header
        auth_str = f"{account_sid}:{auth_token}"
        auth_b64 = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
        
        req = urllib.request.Request(url, data=post_data, method='POST')
        req.add_header('Authorization', f'Basic {auth_b64}')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print("Twilio notification response:", res_body)
            return jsonify({"status": "success", "twilio_response": json.loads(res_body)})
            
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f"Twilio HTTP Error ({e.code}): {err_body}")
        return jsonify({"status": "failed", "error": err_body, "http_code": e.code}), 500
    except Exception as e:
        print("Error sending Twilio notification:", e)
        return jsonify({"status": "failed", "error": str(e)}), 500

@socketio.on('connect')
def test_connect():
    print('Client connected')
    emit('initial_data', {"vehicles": list(vehicles.values())})

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # Use eventlet or pure Flask for dev. 
    # Specifying allow_unsafe_werkzeug to run in simple mode easily.
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
