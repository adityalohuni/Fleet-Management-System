use fleet_management_backend::repositories::postgres::logistics_repo::{
    RouteRepository, ShipmentRepository
};
use fleet_management_backend::repositories::{RouteRepositoryTrait, ShipmentRepositoryTrait};
use fleet_management_backend::models::postgres::logistics::{
    CreateRouteDto, CreateShipmentDto
};
use sqlx::PgPool;
use serde_json::json;

mod common;

#[sqlx::test]
async fn test_logistics_flow(pool: PgPool) -> sqlx::Result<()> {
    let route_repo = RouteRepository::new(pool.clone());
    let shipment_repo = ShipmentRepository::new(pool.clone());

    // 1. Create Customer & Job using Helpers
    let customer = common::create_test_customer(&pool).await;
    let job = common::create_test_job(&pool, customer.id).await;

    // 2. Create Route
    let origin = json!({
        "type": "Point",
        "coordinates": [-73.935242, 40.730610] // New York
    });
    let destination = json!({
        "type": "Point",
        "coordinates": [-118.243683, 34.052235] // Los Angeles
    });
    
    let route_dto = CreateRouteDto {
        job_id: job.id,
        origin: origin.clone(),
        destination: destination.clone(),
        waypoints: None,
    };
    let route = route_repo.create(route_dto).await.expect("Failed to create route");
    
    // Verify Route
    let found_route = route_repo.find_by_job_id(job.id).await.expect("Failed to find route");
    assert!(found_route.is_some());

    // 3. Create Shipment
    let shipment_dto = CreateShipmentDto {
        job_id: job.id,
        weight: 500.0,
        dimensions: json!({"length": 10, "width": 10, "height": 10}),
        r#type: "Electronics".to_string(),
    };
    let shipment = shipment_repo.create(shipment_dto).await.expect("Failed to create shipment");

    // Verify Shipment
    let shipments = shipment_repo.find_by_job_id(job.id).await.expect("Failed to find shipments");
    assert_eq!(shipments.len(), 1);
    assert_eq!(shipments[0].id, shipment.id);

    Ok(())
}
