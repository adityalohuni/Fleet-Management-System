#!/usr/bin/env python3
"""
Fleet Management API Testing Script
Tests all backend APIs with realistic data and saves results to CSV files
"""

import requests
import json
import csv
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random
from faker import Faker
import uuid

# Initialize Faker for realistic data generation
fake = Faker()

# API Configuration
BASE_URL = "http://127.0.0.1:8080/api"
AUTH_TOKEN = None

# CSV output files
CSV_FILES = {
    'credentials': 'test_credentials.csv',
    'vehicles': 'test_vehicles.csv',
    'drivers': 'test_drivers.csv',
    'assignments': 'test_assignments.csv',
    'maintenance_records': 'test_maintenance_records.csv',
    'maintenance_schedules': 'test_maintenance_schedules.csv',
    'alerts': 'test_alerts.csv',
    'customers': 'test_customers.csv',
    'transport_jobs': 'test_transport_jobs.csv',
    'routes': 'test_routes.csv',
    'shipments': 'test_shipments.csv',
    'telemetry': 'test_telemetry.csv',
}

# Storage for created entities
created_entities = {
    'users': [],
    'vehicles': [],
    'drivers': [],
    'assignments': [],
    'maintenance_records': [],
    'maintenance_schedules': [],
    'alerts': [],
    'customers': [],
    'transport_jobs': [],
    'routes': [],
    'shipments': [],
    'telemetry': [],
}

# Realistic vehicle data
VEHICLE_MAKES_MODELS = [
    ('Ford', 'F-150', 'Truck'),
    ('Ford', 'Transit', 'Van'),
    ('Chevrolet', 'Silverado', 'Truck'),
    ('Mercedes-Benz', 'Sprinter', 'Van'),
    ('Toyota', 'Tundra', 'Truck'),
    ('Toyota', 'Camry', 'Sedan'),
    ('Honda', 'Accord', 'Sedan'),
    ('Ram', '1500', 'Truck'),
    ('GMC', 'Sierra', 'Truck'),
    ('Nissan', 'Altima', 'Sedan'),
    ('Dodge', 'Grand Caravan', 'Van'),
    ('Ford', 'E-Series', 'Van'),
    ('Freightliner', 'M2', 'Truck'),
    ('Isuzu', 'NPR', 'Truck'),
    ('Volkswagen', 'Crafter', 'Van'),
]

FUEL_TYPES = ['Diesel', 'Gasoline', 'Electric']
VEHICLE_STATUSES = ['Available', 'Assigned', 'Maintenance', 'OutOfService']
DRIVER_STATUSES = ['Available', 'OnDuty', 'OffDuty', 'SickLeave']
USER_ROLES = ['Admin', 'Manager', 'Driver', 'Mechanic']
ASSIGNMENT_STATUSES = ['Scheduled', 'Active', 'Completed', 'Cancelled']
MAINTENANCE_TYPES = ['Preventive', 'Repair', 'Inspection', 'Accident']
ALERT_SEVERITIES = ['Low', 'Medium', 'High', 'Critical']
JOB_STATUSES = ['Pending', 'InProgress', 'Delivered', 'Invoiced', 'Paid']

def setup_csv_files():
    """Initialize all CSV files with headers"""
    # Credentials
    with open(CSV_FILES['credentials'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Email', 'Password', 'Role', 'Name', 'User ID', 'Token'])
    
    # Vehicles
    with open(CSV_FILES['vehicles'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Make', 'Model', 'Year', 'VIN', 'License Plate', 'Type', 'Status', 'Mileage', 'Fuel Type'])
    
    # Drivers
    with open(CSV_FILES['drivers'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'User ID', 'Name', 'Email', 'License Number', 'Status', 'Phone', 'License Expiry'])
    
    # Assignments
    with open(CSV_FILES['assignments'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Vehicle ID', 'Driver ID', 'Start Time', 'End Time', 'Status'])
    
    # Maintenance Records
    with open(CSV_FILES['maintenance_records'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Vehicle ID', 'Type', 'Cost', 'Date', 'Provider', 'Description'])
    
    # Maintenance Schedules
    with open(CSV_FILES['maintenance_schedules'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Vehicle Type', 'Interval KM', 'Interval Months'])
    
    # Alerts
    with open(CSV_FILES['alerts'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Entity ID', 'Type', 'Severity', 'Is Resolved', 'Created At'])
    
    # Customers
    with open(CSV_FILES['customers'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Name', 'Contact Info', 'Billing Address'])
    
    # Transport Jobs
    with open(CSV_FILES['transport_jobs'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Customer ID', 'Status', 'Agreed Price'])
    
    # Routes
    with open(CSV_FILES['routes'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Job ID', 'Origin', 'Destination'])
    
    # Shipments
    with open(CSV_FILES['shipments'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Job ID', 'Weight', 'Dimensions', 'Type'])
    
    # Telemetry
    with open(CSV_FILES['telemetry'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Time', 'Vehicle ID', 'Location', 'Speed', 'Fuel Level'])

def generate_vin():
    """Generate a realistic VIN (Vehicle Identification Number)"""
    return ''.join(random.choices('ABCDEFGHJKLMNPRSTUVWXYZ0123456789', k=17))

def generate_license_plate():
    """Generate a realistic license plate"""
    return f"{fake.bothify('???-####')}"

def generate_license_number():
    """Generate a realistic driver's license number"""
    return fake.bothify('??######')

def api_request(method: str, endpoint: str, data: Dict = None, auth: bool = True) -> Dict:
    """Make an API request"""
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    
    if auth and AUTH_TOKEN:
        headers['Authorization'] = f"Bearer {AUTH_TOKEN}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method.upper() == 'PUT':
            response = requests.put(url, headers=headers, json=data)
        elif method.upper() == 'PATCH':
            response = requests.patch(url, headers=headers, json=data)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if response.status_code >= 400:
            print(f"Error {response.status_code} on {method} {endpoint}: {response.text}")
            return None
        
        if response.status_code == 204:  # No Content
            return {'success': True}
        
        return response.json()
    except Exception as e:
        print(f"Exception on {method} {endpoint}: {e}")
        return None

def create_test_users(count: int = 20):
    """Create test user accounts"""
    print(f"\n{'='*60}")
    print(f"Creating {count} test user accounts...")
    print(f"{'='*60}")
    
    for i in range(count):
        name = fake.name()
        email = fake.email()
        password = fake.password(length=12)
        role = random.choice(USER_ROLES)
        
        user_data = {
            'name': name,
            'email': email,
            'password_hash': password,  # In real app this would be hashed
            'role': role,
            'is_active': True
        }
        
        result = api_request('POST', '/auth/register', user_data, auth=False)
        
        if result:
            user_id = result.get('user', {}).get('id')
            token = result.get('token')
            
            # Save to CSV
            with open(CSV_FILES['credentials'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([email, password, role, name, user_id, token])
            
            created_entities['users'].append({
                'id': user_id,
                'email': email,
                'password': password,
                'role': role,
                'name': name,
                'token': token
            })
            
            print(f"✓ Created user {i+1}/{count}: {name} ({email}) - {role}")
        else:
            print(f"✗ Failed to create user {i+1}/{count}")

def login_as_admin():
    """Login with the first admin account"""
    global AUTH_TOKEN
    
    admin_users = [u for u in created_entities['users'] if u['role'] == 'Admin']
    if not admin_users:
        # Create an admin if none exists
        print("\nNo admin users found, creating one...")
        admin_email = 'admin@fleet.com'
        admin_password = 'Admin123!@#'
        
        admin_data = {
            'name': 'System Administrator',
            'email': admin_email,
            'password_hash': admin_password,
            'role': 'Admin',
            'is_active': True
        }
        
        result = api_request('POST', '/auth/register', admin_data, auth=False)
        if result:
            AUTH_TOKEN = result.get('token')
            created_entities['users'].append({
                'id': result.get('user', {}).get('id'),
                'email': admin_email,
                'password': admin_password,
                'role': 'Admin',
                'name': 'System Administrator',
                'token': AUTH_TOKEN
            })
            with open(CSV_FILES['credentials'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([admin_email, admin_password, 'Admin', 'System Administrator', 
                               result.get('user', {}).get('id'), AUTH_TOKEN])
            print(f"✓ Created admin user: {admin_email}")
    else:
        AUTH_TOKEN = admin_users[0]['token']
        print(f"✓ Using admin user: {admin_users[0]['email']}")

def create_vehicles(count: int = 50):
    """Create vehicle records"""
    print(f"\n{'='*60}")
    print(f"Creating {count} vehicles...")
    print(f"{'='*60}")
    
    for i in range(count):
        make, model, vtype = random.choice(VEHICLE_MAKES_MODELS)
        year = random.randint(2015, 2024)
        
        vehicle_data = {
            'make': make,
            'model': model,
            'year': year,
            'vin': generate_vin(),
            'license_plate': generate_license_plate(),
            'type': vtype,
            'current_mileage': random.randint(5000, 150000),
            'fuel_type': random.choice(FUEL_TYPES),
            'specs': {
                'cargo_capacity': random.randint(500, 5000),
                'max_weight': random.randint(1000, 10000),
                'color': fake.color_name()
            }
        }
        
        result = api_request('POST', '/vehicles', vehicle_data)
        
        if result:
            vehicle_id = result.get('id')
            created_entities['vehicles'].append(result)
            
            with open(CSV_FILES['vehicles'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    vehicle_id,
                    make,
                    model,
                    year,
                    vehicle_data['vin'],
                    vehicle_data['license_plate'],
                    vtype,
                    result.get('status', 'AVAILABLE'),
                    vehicle_data['current_mileage'],
                    vehicle_data['fuel_type']
                ])
            
            print(f"✓ Created vehicle {i+1}/{count}: {year} {make} {model} ({vehicle_data['license_plate']})")
        else:
            print(f"✗ Failed to create vehicle {i+1}/{count}")

def create_drivers(count: int = 30):
    """Create driver records"""
    print(f"\n{'='*60}")
    print(f"Creating {count} drivers...")
    print(f"{'='*60}")
    
    # Get users with DRIVER role
    driver_users = [u for u in created_entities['users'] if u['role'] == 'Driver']
    
    # Create additional users if needed
    while len(driver_users) < count:
        name = fake.name()
        email = fake.email()
        password = fake.password(length=12)
        
        user_data = {
            'name': name,
            'email': email,
            'password_hash': password,
            'role': 'Driver',
            'is_active': True
        }
        
        result = api_request('POST', '/auth/register', user_data, auth=False)
        if result:
            user_info = {
                'id': result.get('user', {}).get('id'),
                'email': email,
                'password': password,
                'role': 'Driver',
                'name': name,
                'token': result.get('token')
            }
            created_entities['users'].append(user_info)
            driver_users.append(user_info)
            
            with open(CSV_FILES['credentials'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([email, password, 'Driver', name, user_info['id'], result.get('token')])
    
    # Create driver profiles
    for i, user in enumerate(driver_users[:count]):
        driver_data = {
            'user_id': user['id'],
            'license_number': generate_license_number(),
            'status': random.choice(DRIVER_STATUSES)
        }
        
        result = api_request('POST', '/drivers', driver_data)
        
        if result:
            driver_id = result.get('id')
            created_entities['drivers'].append(result)
            
            # Generate license expiry date (1-5 years in the future)
            expiry_date = (datetime.now() + timedelta(days=random.randint(365, 1825))).strftime('%Y-%m-%d')
            
            with open(CSV_FILES['drivers'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    driver_id,
                    user['id'],
                    user['name'],
                    user['email'],
                    driver_data['license_number'],
                    driver_data['status'],
                    fake.phone_number(),
                    expiry_date
                ])
            
            print(f"✓ Created driver {i+1}/{count}: {user['name']} ({driver_data['license_number']})")
        else:
            print(f"✗ Failed to create driver {i+1}/{count}")

def create_assignments(count: int = 40):
    """Create vehicle-driver assignments"""
    print(f"\n{'='*60}")
    print(f"Creating {count} assignments...")
    print(f"{'='*60}")
    
    if not created_entities['vehicles'] or not created_entities['drivers']:
        print("⚠ Need vehicles and drivers first!")
        return
    
    for i in range(count):
        vehicle = random.choice(created_entities['vehicles'])
        driver = random.choice(created_entities['drivers'])
        status = random.choice(ASSIGNMENT_STATUSES)
        
        start_time = datetime.now() - timedelta(days=random.randint(0, 30))
        end_time = None
        
        if status == 'Completed':
            end_time = start_time + timedelta(hours=random.randint(4, 48))
        
        assignment_data = {
            'vehicle_id': vehicle['id'],
            'driver_id': driver['id'],
            'start_time': start_time.isoformat() + 'Z',
            'end_time': end_time.isoformat() + 'Z' if end_time else None,
            'status': status
        }
        
        result = api_request('POST', '/assignments', assignment_data)
        
        if result:
            assignment_id = result.get('id')
            created_entities['assignments'].append(result)
            
            with open(CSV_FILES['assignments'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    assignment_id,
                    vehicle['id'],
                    driver['id'],
                    assignment_data['start_time'],
                    assignment_data['end_time'] if end_time else '',
                    status
                ])
            
            print(f"✓ Created assignment {i+1}/{count}: {status}")
        else:
            print(f"✗ Failed to create assignment {i+1}/{count}")

def create_maintenance_records(count: int = 60):
    """Create maintenance records"""
    print(f"\n{'='*60}")
    print(f"Creating {count} maintenance records...")
    print(f"{'='*60}")
    
    if not created_entities['vehicles']:
        print("⚠ Need vehicles first!")
        return
    
    providers = [
        'AutoCare Services',
        'Fleet Maintenance Inc',
        'QuickFix Garage',
        'Premium Auto Repair',
        'TruckCare Center',
        'Express Service Station',
        'Professional Auto Care',
        'Elite Vehicle Services'
    ]
    
    descriptions = [
        'Oil change and filter replacement',
        'Brake pad replacement',
        'Tire rotation and alignment',
        'Engine diagnostics',
        'Transmission fluid change',
        'Air conditioning service',
        'Battery replacement',
        'Exhaust system repair',
        'Annual safety inspection',
        'Coolant system flush',
        'Spark plug replacement',
        'Suspension repair',
        'Windshield replacement',
        'Electrical system check'
    ]
    
    for i in range(count):
        vehicle = random.choice(created_entities['vehicles'])
        mtype = random.choice(MAINTENANCE_TYPES)
        
        # Cost varies by type
        if mtype == 'Preventive':
            cost = round(random.uniform(50, 300), 2)
        elif mtype == 'Inspection':
            cost = round(random.uniform(30, 150), 2)
        elif mtype == 'Repair':
            cost = round(random.uniform(200, 2000), 2)
        else:  # Accident
            cost = round(random.uniform(500, 5000), 2)
        
        maintenance_date = datetime.now() - timedelta(days=random.randint(1, 180))
        
        maintenance_data = {
            'vehicle_id': vehicle['id'],
            'type': mtype,
            'cost': str(cost),
            'date': maintenance_date.isoformat() + 'Z',
            'provider': random.choice(providers),
            'description': random.choice(descriptions)
        }
        
        result = api_request('POST', '/maintenance/records', maintenance_data)
        
        if result:
            record_id = result.get('id')
            created_entities['maintenance_records'].append(result)
            
            with open(CSV_FILES['maintenance_records'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    record_id,
                    vehicle['id'],
                    mtype,
                    cost,
                    maintenance_date.strftime('%Y-%m-%d'),
                    maintenance_data['provider'],
                    maintenance_data['description']
                ])
            
            print(f"✓ Created maintenance record {i+1}/{count}: {mtype} - ${cost}")
        else:
            print(f"✗ Failed to create maintenance record {i+1}/{count}")

def create_maintenance_schedules():
    """Create maintenance schedules for each vehicle type"""
    print(f"\n{'='*60}")
    print(f"Creating maintenance schedules...")
    print(f"{'='*60}")
    
    vehicle_types = ['Truck', 'Van', 'Sedan']
    
    for vtype in vehicle_types:
        schedule_data = {
            'vehicle_type': vtype,
            'interval_km': random.randint(5000, 15000),
            'interval_months': random.randint(3, 12)
        }
        
        result = api_request('POST', '/maintenance/schedules', schedule_data)
        
        if result:
            schedule_id = result.get('id')
            created_entities['maintenance_schedules'].append(result)
            
            with open(CSV_FILES['maintenance_schedules'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    schedule_id,
                    vtype,
                    schedule_data['interval_km'],
                    schedule_data['interval_months']
                ])
            
            print(f"✓ Created maintenance schedule for {vtype}: {schedule_data['interval_km']}km / {schedule_data['interval_months']} months")
        else:
            print(f"✗ Failed to create maintenance schedule for {vtype}")

def create_alerts(count: int = 25):
    """Create maintenance/safety alerts"""
    print(f"\n{'='*60}")
    print(f"Creating {count} alerts...")
    print(f"{'='*60}")
    
    entities = created_entities['vehicles'] + created_entities['drivers']
    if not entities:
        print("⚠ Need vehicles or drivers first!")
        return
    
    alert_types = [
        'Maintenance Due',
        'License Expiry Warning',
        'Low Fuel Alert',
        'Engine Warning',
        'Tire Pressure Low',
        'Brake System Alert',
        'Battery Warning',
        'Overdue Inspection',
        'Speed Violation',
        'Harsh Braking Event'
    ]
    
    for i in range(count):
        entity = random.choice(entities)
        
        alert_data = {
            'entity_id': entity['id'],
            'type': random.choice(alert_types),
            'severity': random.choice(ALERT_SEVERITIES)
        }
        
        result = api_request('POST', '/maintenance/alerts', alert_data)
        
        if result:
            alert_id = result.get('id')
            created_entities['alerts'].append(result)
            
            with open(CSV_FILES['alerts'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    alert_id,
                    entity['id'],
                    alert_data['type'],
                    alert_data['severity'],
                    False,
                    result.get('created_at', '')
                ])
            
            print(f"✓ Created alert {i+1}/{count}: {alert_data['type']} ({alert_data['severity']})")
        else:
            print(f"✗ Failed to create alert {i+1}/{count}")

def create_customers(count: int = 40):
    """Create customer records"""
    print(f"\n{'='*60}")
    print(f"Creating {count} customers...")
    print(f"{'='*60}")
    
    for i in range(count):
        company_name = fake.company()
        
        contact_info = {
            'phone': fake.phone_number(),
            'email': fake.company_email(),
            'contact_person': fake.name()
        }
        
        customer_data = {
            'name': company_name,
            'contact_info': contact_info,
            'billing_address': fake.address().replace('\n', ', ')
        }
        
        result = api_request('POST', '/logistics/customers', customer_data)
        
        if result:
            customer_id = result.get('id')
            created_entities['customers'].append(result)
            
            with open(CSV_FILES['customers'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    customer_id,
                    company_name,
                    json.dumps(contact_info),
                    customer_data['billing_address']
                ])
            
            print(f"✓ Created customer {i+1}/{count}: {company_name}")
        else:
            print(f"✗ Failed to create customer {i+1}/{count}")

def create_transport_jobs(count: int = 50):
    """Create transport job records"""
    print(f"\n{'='*60}")
    print(f"Creating {count} transport jobs...")
    print(f"{'='*60}")
    
    if not created_entities['customers']:
        print("⚠ Need customers first!")
        return
    
    for i in range(count):
        customer = random.choice(created_entities['customers'])
        status = random.choice(JOB_STATUSES)
        
        job_data = {
            'customer_id': customer['id'],
            'status': status,
            'agreed_price': str(round(random.uniform(500, 10000), 2))
        }
        
        result = api_request('POST', '/logistics/jobs', job_data)
        
        if result:
            job_id = result.get('id')
            created_entities['transport_jobs'].append(result)
            
            with open(CSV_FILES['transport_jobs'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    job_id,
                    customer['id'],
                    status,
                    job_data['agreed_price']
                ])
            
            print(f"✓ Created transport job {i+1}/{count}: {status} - ${job_data['agreed_price']}")
        else:
            print(f"✗ Failed to create transport job {i+1}/{count}")

def create_routes(count: int = 50):
    """Create route records for transport jobs"""
    print(f"\n{'='*60}")
    print(f"Creating {count} routes...")
    print(f"{'='*60}")
    
    if not created_entities['transport_jobs']:
        print("⚠ Need transport jobs first!")
        return
    
    for i, job in enumerate(created_entities['transport_jobs'][:count]):
        # Generate realistic coordinates (US-based)
        origin_lat = round(random.uniform(25.0, 49.0), 6)
        origin_lng = round(random.uniform(-125.0, -66.0), 6)
        dest_lat = round(random.uniform(25.0, 49.0), 6)
        dest_lng = round(random.uniform(-125.0, -66.0), 6)
        
        route_data = {
            'job_id': job['id'],
            'origin': {
                'type': 'Point',
                'coordinates': [origin_lng, origin_lat]
            },
            'destination': {
                'type': 'Point',
                'coordinates': [dest_lng, dest_lat]
            },
            'waypoints': None
        }
        
        result = api_request('POST', '/logistics/routes', route_data)
        
        if result:
            route_id = result.get('id')
            created_entities['routes'].append(result)
            
            with open(CSV_FILES['routes'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    route_id,
                    job['id'],
                    json.dumps(route_data['origin']),
                    json.dumps(route_data['destination'])
                ])
            
            print(f"✓ Created route {i+1}/{count} for job {job['id']}")
        else:
            print(f"✗ Failed to create route {i+1}/{count}")

def create_shipments(count: int = 70):
    """Create shipment records"""
    print(f"\n{'='*60}")
    print(f"Creating {count} shipments...")
    print(f"{'='*60}")
    
    if not created_entities['transport_jobs']:
        print("⚠ Need transport jobs first!")
        return
    
    shipment_types = [
        'Palletized Freight',
        'Electronics',
        'Machinery',
        'Food & Beverage',
        'Pharmaceuticals',
        'Textiles',
        'Automotive Parts',
        'Construction Materials',
        'Consumer Goods',
        'Raw Materials'
    ]
    
    for i in range(count):
        job = random.choice(created_entities['transport_jobs'])
        
        dimensions = {
            'length': round(random.uniform(1.0, 10.0), 2),
            'width': round(random.uniform(1.0, 5.0), 2),
            'height': round(random.uniform(1.0, 5.0), 2)
        }
        
        shipment_data = {
            'job_id': job['id'],
            'weight': round(random.uniform(50, 5000), 2),
            'dimensions': dimensions,
            'type': random.choice(shipment_types)
        }
        
        result = api_request('POST', '/logistics/shipments', shipment_data)
        
        if result:
            shipment_id = result.get('id')
            created_entities['shipments'].append(result)
            
            with open(CSV_FILES['shipments'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    shipment_id,
                    job['id'],
                    shipment_data['weight'],
                    json.dumps(dimensions),
                    shipment_data['type']
                ])
            
            print(f"✓ Created shipment {i+1}/{count}: {shipment_data['type']} - {shipment_data['weight']}kg")
        else:
            print(f"✗ Failed to create shipment {i+1}/{count}")

def create_telemetry_data(count: int = 100):
    """Create vehicle telemetry records"""
    print(f"\n{'='*60}")
    print(f"Creating {count} telemetry records...")
    print(f"{'='*60}")
    
    if not created_entities['vehicles']:
        print("⚠ Need vehicles first!")
        return
    
    for i in range(count):
        vehicle = random.choice(created_entities['vehicles'])
        
        # Generate realistic coordinates
        lat = round(random.uniform(25.0, 49.0), 6)
        lng = round(random.uniform(-125.0, -66.0), 6)
        
        telemetry_time = datetime.now() - timedelta(hours=random.randint(0, 72))
        
        telemetry_data = {
            'time': telemetry_time.isoformat() + 'Z',
            'vehicle_id': vehicle['id'],
            'location': {
                'type': 'Point',
                'coordinates': [lng, lat]
            },
            'speed': round(random.uniform(0, 120), 2),
            'fuel_level': round(random.uniform(10, 100), 2),
            'engine_status': {
                'rpm': random.randint(500, 4000),
                'temperature': random.randint(70, 110),
                'oil_pressure': random.randint(20, 60)
            }
        }
        
        result = api_request('POST', '/telemetry', telemetry_data)
        
        if result:
            created_entities['telemetry'].append(result)
            
            with open(CSV_FILES['telemetry'], 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    telemetry_time.isoformat(),
                    vehicle['id'],
                    json.dumps(telemetry_data['location']),
                    telemetry_data['speed'],
                    telemetry_data['fuel_level']
                ])
            
            print(f"✓ Created telemetry {i+1}/{count} for vehicle {vehicle['license_plate']}")
        else:
            print(f"✗ Failed to create telemetry {i+1}/{count}")

def delete_all_data():
    """Delete all created test data"""
    print(f"\n{'='*60}")
    print(f"DELETING ALL TEST DATA")
    print(f"{'='*60}")
    
    # Delete in reverse order of dependencies
    
    # Telemetry (no dependencies on it)
    print("\nDeleting telemetry data...")
    # Telemetry is time-series, typically wouldn't have individual delete endpoints
    
    # Shipments
    print("\nDeleting shipments...")
    for shipment in created_entities['shipments']:
        # No delete endpoint in routes, skip
        pass
    
    # Routes
    print("\nDeleting routes...")
    for route in created_entities['routes']:
        # No delete endpoint in routes, skip
        pass
    
    # Transport Jobs
    print("\nDeleting transport jobs...")
    for job in created_entities['transport_jobs']:
        # No delete endpoint in routes, skip
        pass
    
    # Customers
    print("\nDeleting customers...")
    for customer in created_entities['customers']:
        result = api_request('DELETE', f"/logistics/customers/{customer['id']}")
        if result:
            print(f"✓ Deleted customer {customer['id']}")
    
    # Alerts
    print("\nDeleting alerts...")
    for alert in created_entities['alerts']:
        # Resolve instead of delete
        result = api_request('PATCH', f"/maintenance/alerts/{alert['id']}/resolve")
        if result:
            print(f"✓ Resolved alert {alert['id']}")
    
    # Maintenance Records
    print("\nDeleting maintenance records...")
    for record in created_entities['maintenance_records']:
        # No delete endpoint, skip
        pass
    
    # Maintenance Schedules
    print("\nDeleting maintenance schedules...")
    for schedule in created_entities['maintenance_schedules']:
        # No delete endpoint, skip
        pass
    
    # Assignments
    print("\nDeleting assignments...")
    for assignment in created_entities['assignments']:
        # No delete endpoint, skip
        pass
    
    # Drivers
    print("\nDeleting drivers...")
    for driver in created_entities['drivers']:
        result = api_request('DELETE', f"/drivers/{driver['id']}")
        if result:
            print(f"✓ Deleted driver {driver['id']}")
    
    # Vehicles
    print("\nDeleting vehicles...")
    for vehicle in created_entities['vehicles']:
        result = api_request('DELETE', f"/vehicles/{vehicle['id']}")
        if result:
            print(f"✓ Deleted vehicle {vehicle['id']}")
    
    # Users (no delete endpoint typically)
    print("\nUsers remain in the system (no delete endpoint)")
    
    print(f"\n{'='*60}")
    print("DATA DELETION COMPLETE")
    print(f"{'='*60}")

def main():
    """Main execution function"""
    print("=" * 60)
    print("FLEET MANAGEMENT API TESTING SCRIPT")
    print("=" * 60)
    
    setup_csv_files()
    
    # Phase 1: Authentication
    create_test_users(20)
    login_as_admin()
    
    # Phase 2: Core Entities
    create_vehicles(50)
    create_drivers(30)
    
    # Phase 3: Operations
    create_assignments(40)
    create_maintenance_records(60)
    create_maintenance_schedules()
    create_alerts(25)
    
    # Phase 4: Logistics
    create_customers(40)
    create_transport_jobs(50)
    create_routes(50)
    create_shipments(70)
    
    # Phase 5: Telemetry
    create_telemetry_data(100)
    
    # Summary
    print(f"\n{'='*60}")
    print("TESTING SUMMARY")
    print(f"{'='*60}")
    print(f"Users created: {len(created_entities['users'])}")
    print(f"Vehicles created: {len(created_entities['vehicles'])}")
    print(f"Drivers created: {len(created_entities['drivers'])}")
    print(f"Assignments created: {len(created_entities['assignments'])}")
    print(f"Maintenance records: {len(created_entities['maintenance_records'])}")
    print(f"Maintenance schedules: {len(created_entities['maintenance_schedules'])}")
    print(f"Alerts created: {len(created_entities['alerts'])}")
    print(f"Customers created: {len(created_entities['customers'])}")
    print(f"Transport jobs created: {len(created_entities['transport_jobs'])}")
    print(f"Routes created: {len(created_entities['routes'])}")
    print(f"Shipments created: {len(created_entities['shipments'])}")
    print(f"Telemetry records: {len(created_entities['telemetry'])}")
    print(f"\nAll data saved to CSV files!")
    
    # Ask user if they want to delete the data
    print(f"\n{'='*60}")
    response = input("Do you want to DELETE all created test data? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        delete_all_data()
    else:
        print("Test data preserved. You can manually delete it later.")

if __name__ == '__main__':
    main()
