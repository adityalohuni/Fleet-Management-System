use actix_web::{web, HttpResponse, Responder};
use crate::models::postgres::vehicle::{CreateVehicleDto, VehicleStatus};
use crate::services::vehicle_service::VehicleServiceTrait;
use uuid::Uuid;

pub async fn get_vehicles(service: web::Data<dyn VehicleServiceTrait>) -> impl Responder {
    let result = service.list_vehicles().await;

    match result {
        Ok(vehicles) => HttpResponse::Ok().json(vehicles),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_vehicle_by_id(
    service: web::Data<dyn VehicleServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    let result = service.get_vehicle(id).await;

    match result {
        Ok(vehicle) => HttpResponse::Ok().json(vehicle),
        Err(e) => HttpResponse::NotFound().body(e.to_string()),
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

#[derive(serde::Deserialize)]
pub struct UpdateVehicleDto {
    pub status: Option<VehicleStatus>,
}

pub async fn update_vehicle(
    service: web::Data<dyn VehicleServiceTrait>,
    path: web::Path<Uuid>,
    item: web::Json<UpdateVehicleDto>,
) -> impl Responder {
    let id = path.into_inner();
    
    // For now, we only support status updates
    if let Some(status) = item.status {
        let result = service.update_vehicle_status(id, status).await;
        match result {
            Ok(vehicle) => HttpResponse::Ok().json(vehicle),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        }
    } else {
        HttpResponse::BadRequest().body("No updates provided")
    }
}

pub async fn delete_vehicle(
    service: web::Data<dyn VehicleServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    let result = service.delete_vehicle(id).await;

    match result {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/vehicles")
            .route("", web::get().to(get_vehicles))
            .route("", web::post().to(create_vehicle))
            .route("/{id}", web::get().to(get_vehicle_by_id))
            .route("/{id}", web::put().to(update_vehicle))
            .route("/{id}", web::delete().to(delete_vehicle))
    );
}
