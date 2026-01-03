use actix_web::{web, HttpResponse};
use crate::services::vehicle_service::VehicleServiceTrait;
use crate::api::dto::vehicle_dto::{CreateVehicleRequest, VehicleResponse, UpdateVehicleStatusRequest};
use crate::models::postgres::vehicle::CreateVehicleDto;
use crate::error::AppError;
use validator::Validate;
use uuid::Uuid;

#[utoipa::path(
    get,
    path = "/api/v1/vehicles",
    responses(
        (status = 200, description = "List all vehicles", body = Vec<VehicleResponse>)
    )
)]
pub async fn get_vehicles(service: web::Data<dyn VehicleServiceTrait>) -> Result<HttpResponse, AppError> {
    let vehicles = service.list_vehicles().await?;
    let response: Vec<VehicleResponse> = vehicles.into_iter().map(VehicleResponse::from).collect();
    Ok(HttpResponse::Ok().json(response))
}

#[utoipa::path(
    get,
    path = "/api/v1/vehicles/{id}",
    responses(
        (status = 200, description = "Get vehicle by ID", body = VehicleResponse),
        (status = 404, description = "Vehicle not found")
    )
)]
pub async fn get_vehicle(
    path: web::Path<Uuid>,
    service: web::Data<dyn VehicleServiceTrait>
) -> Result<HttpResponse, AppError> {
    let vehicle = service.get_vehicle(path.into_inner()).await?;
    Ok(HttpResponse::Ok().json(VehicleResponse::from(vehicle)))
}

#[utoipa::path(
    post,
    path = "/api/v1/vehicles",
    request_body = CreateVehicleRequest,
    responses(
        (status = 201, description = "Vehicle created", body = VehicleResponse),
        (status = 400, description = "Validation error")
    )
)]
pub async fn create_vehicle(
    service: web::Data<dyn VehicleServiceTrait>,
    item: web::Json<CreateVehicleRequest>,
) -> Result<HttpResponse, AppError> {
    item.validate().map_err(|e| AppError::ValidationError(e))?;
    
    let req = item.into_inner();
    let dto = CreateVehicleDto {
        make: req.make,
        model: req.model,
        year: req.year,
        vin: req.vin,
        license_plate: req.license_plate,
        r#type: req.r#type,
        current_mileage: req.current_mileage,
        fuel_type: req.fuel_type,
        specs: req.specs,
    };

    let vehicle = service.create_vehicle(dto).await?;
    Ok(HttpResponse::Created().json(VehicleResponse::from(vehicle)))
}

#[utoipa::path(
    patch,
    path = "/api/v1/vehicles/{id}/status",
    request_body = UpdateVehicleStatusRequest,
    responses(
        (status = 200, description = "Vehicle status updated", body = VehicleResponse),
        (status = 404, description = "Vehicle not found")
    )
)]
pub async fn update_vehicle_status(
    path: web::Path<Uuid>,
    service: web::Data<dyn VehicleServiceTrait>,
    item: web::Json<UpdateVehicleStatusRequest>,
) -> Result<HttpResponse, AppError> {
    let vehicle = service.update_vehicle_status(path.into_inner(), item.status).await?;
    Ok(HttpResponse::Ok().json(VehicleResponse::from(vehicle)))
}

#[utoipa::path(
    delete,
    path = "/api/v1/vehicles/{id}",
    responses(
        (status = 204, description = "Vehicle deleted"),
        (status = 404, description = "Vehicle not found")
    )
)]
pub async fn delete_vehicle(
    path: web::Path<Uuid>,
    service: web::Data<dyn VehicleServiceTrait>,
) -> Result<HttpResponse, AppError> {
    service.delete_vehicle(path.into_inner()).await?;
    Ok(HttpResponse::NoContent().finish())
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/vehicles")
            .route("", web::get().to(get_vehicles))
            .route("", web::post().to(create_vehicle))
            .route("/{id}", web::get().to(get_vehicle))
            .route("/{id}", web::delete().to(delete_vehicle))
            .route("/{id}/status", web::patch().to(update_vehicle_status))
    );
}
