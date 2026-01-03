use actix_web::{web, HttpResponse, Responder};
use uuid::Uuid;
use crate::models::postgres::maintenance::{CreateMaintenanceRecordDto, CreateMaintenanceScheduleDto, CreateAlertDto};
use crate::models::postgres::vehicle::VehicleType;
use crate::services::maintenance_service::MaintenanceServiceTrait;

// Records
pub async fn create_record(
    service: web::Data<dyn MaintenanceServiceTrait>,
    dto: web::Json<CreateMaintenanceRecordDto>,
) -> impl Responder {
    let result = service.create_record(dto.into_inner()).await;
    match result {
        Ok(record) => HttpResponse::Created().json(record),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_vehicle_records(
    service: web::Data<dyn MaintenanceServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let vehicle_id = path.into_inner();
    let result = service.get_vehicle_records(vehicle_id).await;
    match result {
        Ok(records) => HttpResponse::Ok().json(records),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// Schedules
pub async fn create_schedule(
    service: web::Data<dyn MaintenanceServiceTrait>,
    dto: web::Json<CreateMaintenanceScheduleDto>,
) -> impl Responder {
    let result = service.create_schedule(dto.into_inner()).await;
    match result {
        Ok(schedule) => HttpResponse::Created().json(schedule),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_schedule(
    service: web::Data<dyn MaintenanceServiceTrait>,
    path: web::Path<VehicleType>,
) -> impl Responder {
    let vehicle_type = path.into_inner();
    let result = service.get_schedule(vehicle_type).await;
    match result {
        Ok(schedule) => HttpResponse::Ok().json(schedule),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// Alerts
pub async fn create_alert(
    service: web::Data<dyn MaintenanceServiceTrait>,
    dto: web::Json<CreateAlertDto>,
) -> impl Responder {
    let result = service.create_alert(dto.into_inner()).await;
    match result {
        Ok(alert) => HttpResponse::Created().json(alert),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_unresolved_alerts(
    service: web::Data<dyn MaintenanceServiceTrait>,
) -> impl Responder {
    let result = service.get_unresolved_alerts().await;
    match result {
        Ok(alerts) => HttpResponse::Ok().json(alerts),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn resolve_alert(
    service: web::Data<dyn MaintenanceServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    let result = service.resolve_alert(id).await;
    match result {
        Ok(alert) => HttpResponse::Ok().json(alert),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/maintenance")
            .route("/records", web::post().to(create_record))
            .route("/records/vehicle/{id}", web::get().to(get_vehicle_records))
            .route("/schedules", web::post().to(create_schedule))
            .route("/schedules/{type}", web::get().to(get_schedule))
            .route("/alerts", web::post().to(create_alert))
            .route("/alerts", web::get().to(get_unresolved_alerts))
            .route("/alerts/{id}/resolve", web::patch().to(resolve_alert))
    );
}
