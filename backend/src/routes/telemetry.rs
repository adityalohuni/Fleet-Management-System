use actix_web::{web, HttpResponse, Responder};
use uuid::Uuid;
use crate::models::postgres::telemetry::CreateVehicleTelemetryDto;
use crate::services::telemetry_service::TelemetryServiceTrait;

pub async fn create_telemetry(
    service: web::Data<dyn TelemetryServiceTrait>,
    dto: web::Json<CreateVehicleTelemetryDto>,
) -> impl Responder {
    match service.create_telemetry(dto.into_inner()).await {
        Ok(telemetry) => HttpResponse::Created().json(telemetry),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_latest_telemetry(
    service: web::Data<dyn TelemetryServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match service.get_latest_telemetry(path.into_inner()).await {
        Ok(telemetry) => HttpResponse::Ok().json(telemetry),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/telemetry")
            .route("", web::post().to(create_telemetry))
            .route("/vehicle/{id}/latest", web::get().to(get_latest_telemetry))
    );
}
