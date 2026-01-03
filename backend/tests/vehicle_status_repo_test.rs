use fleet_management_backend::repositories::redis::vehicle_status_repo::VehicleStatusCacheRepository;
use fleet_management_backend::models::redis::vehicle_status::VehicleStatusCache;
use uuid::Uuid;
use chrono::Utc;

#[tokio::test]
async fn test_vehicle_status_cache() {
    // Attempt to connect to Redis. If it fails, we might want to skip the test or fail.
    // For now, let's assume Redis is running at localhost:6379 as per docker-compose usually.
    let client = redis::Client::open("redis://127.0.0.1/").expect("Failed to create Redis client");
    
    // Check connection
    let mut conn = match client.get_async_connection().await {
        Ok(c) => c,
        Err(_) => {
            println!("Skipping Redis test: Connection failed");
            return;
        }
    };

    let repo = VehicleStatusCacheRepository::new(client);
    let vehicle_id = Uuid::new_v4();

    let status = VehicleStatusCache {
        vehicle_id,
        speed: 50.0,
        latitude: 40.7128,
        longitude: -74.0060,
        driver_id: None,
        last_updated: Utc::now().timestamp(),
    };

    // 1. Set
    repo.set(&status).await.expect("Failed to set status");

    // 2. Get
    let retrieved = repo.get(vehicle_id).await.expect("Failed to get status");
    assert!(retrieved.is_some());
    let retrieved_status = retrieved.unwrap();
    
    assert_eq!(retrieved_status.vehicle_id, vehicle_id);
    assert_eq!(retrieved_status.speed, 50.0);
}
