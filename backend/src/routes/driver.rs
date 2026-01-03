use actix_web::{web, HttpResponse, Responder};
use crate::models::postgres::driver::CreateDriverDto;
use crate::services::driver_service::DriverServiceTrait;

pub async fn get_drivers(service: web::Data<dyn DriverServiceTrait>) -> impl Responder {
    let result = service.list_drivers().await;

    match result {
        Ok(drivers) => HttpResponse::Ok().json(drivers),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
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

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/drivers")
            .route("", web::get().to(get_drivers))
            .route("", web::post().to(create_driver))
    );
}
