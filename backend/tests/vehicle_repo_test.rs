use fleet_management_backend::repositories::postgres::vehicle_repo::{VehicleRepository, VehicleRepositoryTrait};
use fleet_management_backend::models::postgres::vehicle::{CreateVehicleDto, VehicleType, FuelType, VehicleStatus};
use sqlx::PgPool;

#[sqlx::test]
async fn test_create_and_find_vehicle(pool: PgPool) -> sqlx::Result<()> {
    let repo = VehicleRepository::new(pool);

    // 1. Arrange
    let dto = CreateVehicleDto {
        make: "Toyota".to_string(),
        model: "Camry".to_string(),
        year: 2024,
        vin: "TESTVIN123".to_string(),
        license_plate: "TESTPLATE".to_string(),
        r#type: VehicleType::Sedan,
        current_mileage: 0,
        fuel_type: FuelType::Gasoline,
        specs: None,
    };

    // 2. Act
    let created = repo.create(dto).await.expect("Failed to create vehicle");
    let found = repo.find_by_id(created.id).await.expect("Failed to find vehicle");

    // 3. Assert
    assert!(found.is_some());
    let found_vehicle = found.unwrap();
    assert_eq!(found_vehicle.vin, "TESTVIN123");
    assert_eq!(found_vehicle.status, VehicleStatus::Available);

    Ok(())
}

#[sqlx::test]
async fn test_soft_delete_vehicle(pool: PgPool) -> sqlx::Result<()> {
    let repo = VehicleRepository::new(pool);

    // 1. Arrange
    let dto = CreateVehicleDto {
        make: "Ford".to_string(),
        model: "F-150".to_string(),
        year: 2023,
        vin: "TESTVIN456".to_string(),
        license_plate: "TESTPLATE2".to_string(),
        r#type: VehicleType::Truck,
        current_mileage: 1000,
        fuel_type: FuelType::Diesel,
        specs: None,
    };
    let created = repo.create(dto).await.expect("Failed to create vehicle");

    // 2. Act
    repo.delete(created.id).await.expect("Failed to delete vehicle");
    let found = repo.find_by_id(created.id).await.expect("Failed to find vehicle");

    // 3. Assert
    assert!(found.is_none()); // Should not find it because of soft delete filter

    Ok(())
}
