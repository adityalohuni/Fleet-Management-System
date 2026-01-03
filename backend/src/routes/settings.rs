use actix_web::{web, HttpResponse, Responder};
use crate::models::postgres::settings::UpdateAppSettingsDto;
use crate::services::settings_service::SettingsServiceTrait;

pub async fn get_settings(service: web::Data<dyn SettingsServiceTrait>) -> impl Responder {
    match service.get_settings().await {
        Ok(settings) => HttpResponse::Ok().json(settings),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn update_settings(
    service: web::Data<dyn SettingsServiceTrait>,
    dto: web::Json<UpdateAppSettingsDto>,
) -> impl Responder {
    match service.update_settings(dto.into_inner()).await {
        Ok(settings) => HttpResponse::Ok().json(settings),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/settings")
            .route("", web::get().to(get_settings))
            .route("", web::put().to(update_settings)),
    );
}
