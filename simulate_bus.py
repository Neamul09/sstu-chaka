import time
import firebase_admin
from firebase_admin import credentials, db

# 1️⃣  Initialize Firebase Admin SDK
cred = credentials.Certificate("sstu-101-firebase-adminsdk-fbsvc-301388847d.json")  # downloaded from Firebase
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sstu-101-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# 2️⃣  Define a simple campus route (replace with real coords)
route = [
    (37.4219983, -122.084),
    (37.4225, -122.0845),
    (37.4230, -122.0850),
    (37.4235, -122.0855),
    (37.4240, -122.0860),
    (37.4235, -122.0855),
    (37.4230, -122.0850),
    (37.4225, -122.0845),
    (37.4219983, -122.084)
]

bus_ref = db.reference('buses/bus1')

print("Starting simulation. Updating every 10 seconds…")
while True:
    for lat, lon in route:
        data = {
            "lat": lat,
            "lon": lon,
            "timestamp": int(time.time())
        }
        bus_ref.set(data)
        print(f"Updated: {data}")
        time.sleep(3)  # 10 sec interval
