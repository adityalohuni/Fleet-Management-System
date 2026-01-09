use actix_web::{web, HttpResponse, Responder};
use crate::models::postgres::driver::{CreateDriverDto, DriverStatus};
use crate::services::driver_service::DriverServiceTrait;
use uuid::Uuid;

pub async fn get_drivers(service: web::Data<dyn DriverServiceTrait>) -> impl Responder {
    let result = service.list_drivers().await;

    match result {
        Ok(drivers) => HttpResponse::Ok().json(drivers),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_driver_by_id(
    service: web::Data<dyn DriverServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    let result = service.get_driver(id).await;

    match result {
        Ok(driver) => HttpResponse::Ok().json(driver),
        Err(e) => HttpResponse::NotFound().body(e.to_string()),
    }
}

pub async fn create_driver(
    service: web::Data<dyn DriverServiceTrait>,
    item: web::Json<CreateDriverDto>,
) -> impl Responder {
    let result = service.create_driver(item.into_inner()).await;

    match result {
        Ok(driver) => HttpResponse::Created().json(driver),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(serde::Deserialize)]
pub struct UpdateDriverDto {
    pub status: Option<DriverStatus>,
    pub license_number: Option<String>,
}

pub async fn update_driver(
    service: web::Data<dyn DriverServiceTrait>,
    path: web::Path<Uuid>,
    item: web::Json<UpdateDriverDto>,
) -> impl Responder {
    let id = path.into_inner();
    
    // For now, we only support status updates
    if let Some(status) = item.status {
        let result = service.update_driver_status(id, status).await;
        match result {
            Ok(driver) => HttpResponse::Ok().json(driver),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        }
    } else {
        HttpResponse::BadRequest().body("No updates provided")
    }
}

pub async fn delete_driver(
    service: web::Data<dyn DriverServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    let result = service.delete_driver(id).await;

    match result {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/drivers")
            .route("", web::get().to(get_drivers))
            .route("", web::post().to(create_driver))
            .route("/{id}", web::get().to(get_driver_by_id))
            .route("/{id}", web::put().to(update_driver))
            .route("/{id}", web::delete().to(delete_driver))
    );
}
