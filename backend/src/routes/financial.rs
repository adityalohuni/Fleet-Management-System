use actix_web::{web, HttpResponse, Responder};
use crate::services::financial_service::FinancialServiceTrait;

pub async fn get_monthly_summary(service: web::Data<dyn FinancialServiceTrait>) -> impl Responder {
    let result = service.get_monthly_summary().await;
    match result {
        Ok(summary) => HttpResponse::Ok().json(summary),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_vehicle_profitability(service: web::Data<dyn FinancialServiceTrait>) -> impl Responder {
    let result = service.get_vehicle_profitability().await;
    match result {
        Ok(profitability) => HttpResponse::Ok().json(profitability),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/financial")
            .route("/summary", web::get().to(get_monthly_summary))
            .route("/vehicle-profitability", web::get().to(get_vehicle_profitability))
    );
}
