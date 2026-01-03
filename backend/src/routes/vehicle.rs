use actix_web::{web, HttpResponse, Responder};
use crate::models::postgres::vehicle::CreateVehicleDto;
use crate::services::vehicle_service::VehicleServiceTrait;

pub async fn get_vehicles(service: web::Data<dyn VehicleServiceTrait>) -> impl Responder {
    let result = service.list_vehicles().await;

    match result {
        Ok(vehicles) => HttpResponse::Ok().json(vehicles),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn create_vehicle(
    service: web::Data<dyn VehicleServiceTrait>,
    item: web::Json<CreateVehicleDto>,
) -> impl Responder {
    let result = service.create_vehicle(item.into_inner()).await;

    match result {
        Ok(vehicle) => HttpResponse::Created().json(vehicle),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/vehicles")
            .route("", web::get().to(get_vehicles))
            .route("", web::post().to(create_vehicle))
    );
}
