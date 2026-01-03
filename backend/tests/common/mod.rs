use fleet_management_backend::repositories::postgres::vehicle_repo::{VehicleRepository, VehicleRepositoryTrait};
use fleet_management_backend::repositories::postgres::user_repo::{UserRepository, UserRepositoryTrait};
use fleet_management_backend::repositories::postgres::driver_repo::{DriverRepository, DriverRepositoryTrait};
use fleet_management_backend::repositories::postgres::logistics_repo::{CustomerRepository, CustomerRepositoryTrait, TransportJobRepository, TransportJobRepositoryTrait};
use fleet_management_backend::models::postgres::vehicle::{Vehicle, CreateVehicleDto, VehicleType, FuelType};
use fleet_management_backend::models::postgres::user::{User, CreateUserDto, UserRole};
use fleet_management_backend::models::postgres::driver::{Driver, CreateDriverDto, DriverStatus};
use fleet_management_backend::models::postgres::logistics::{Customer, CreateCustomerDto, TransportJob, CreateTransportJobDto, JobStatus};
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::json;
use rust_decimal::Decimal;

pub async fn create_test_vehicle(pool: &PgPool) -> Vehicle {
    let repo = VehicleRepository::new(pool.clone());
    let unique_id = Uuid::new_v4().to_string()[..8].to_string();
    
    let dto = CreateVehicleDto {
        make: "TestMake".to_string(),
        model: "TestModel".to_string(),
        year: 2024,
        vin: format!("VIN{}", unique_id),
        license_plate: format!("PLATE{}", unique_id),
        r#type: VehicleType::Sedan,
        current_mileage: 0,
        fuel_type: FuelType::Gasoline,
        specs: None,
    };
    
    repo.create(dto).await.expect("Failed to create test vehicle")
}

pub async fn create_test_user(pool: &PgPool, role: UserRole) -> User {
    let repo = UserRepository::new(pool.clone());
    let unique_id = Uuid::new_v4().to_string()[..8].to_string();
    
    let dto = CreateUserDto {
        email: format!("user_{}@example.com", unique_id),
        password_hash: "hashed_password".to_string(),
        role,
        is_active: true,
    };
    
    repo.create(dto).await.expect("Failed to create test user")
}

pub async fn create_test_driver(pool: &PgPool) -> (User, Driver) {
    let user = create_test_user(pool, UserRole::Driver).await;
    let repo = DriverRepository::new(pool.clone());
    let unique_id = Uuid::new_v4().to_string()[..8].to_string();
    
    let dto = CreateDriverDto {
        user_id: user.id,
        license_number: format!("DL{}", unique_id),
        status: DriverStatus::Available,
    };
    
    let driver = repo.create(dto).await.expect("Failed to create test driver");
    (user, driver)
}

pub async fn create_test_customer(pool: &PgPool) -> Customer {
    let repo = CustomerRepository::new(pool.clone());
    let unique_id = Uuid::new_v4().to_string()[..8].to_string();
    
    let dto = CreateCustomerDto {
        name: format!("Customer {}", unique_id),
        contact_info: json!({"email": "test@example.com"}),
        billing_address: "123 Test St".to_string(),
    };
    
    repo.create(dto).await.expect("Failed to create test customer")
}

pub async fn create_test_job(pool: &PgPool, customer_id: Uuid) -> TransportJob {
    let repo = TransportJobRepository::new(pool.clone());
    
    let dto = CreateTransportJobDto {
        customer_id,
        status: JobStatus::Pending,
        agreed_price: Decimal::new(10000, 2),
    };
    
    repo.create(dto).await.expect("Failed to create test job")
}
