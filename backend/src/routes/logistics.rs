use actix_web::{web, HttpResponse, Responder};
use uuid::Uuid;
use crate::models::postgres::logistics::{
    CreateCustomerDto, CreateTransportJobDto, CreateRouteDto, CreateShipmentDto, JobStatus
};
use crate::services::logistics_service::LogisticsServiceTrait;

// Customers
pub async fn create_customer(
    service: web::Data<dyn LogisticsServiceTrait>,
    dto: web::Json<CreateCustomerDto>,
) -> impl Responder {
    match service.create_customer(dto.into_inner()).await {
        Ok(customer) => HttpResponse::Created().json(customer),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn list_customers(service: web::Data<dyn LogisticsServiceTrait>) -> impl Responder {
    match service.list_customers().await {
        Ok(customers) => HttpResponse::Ok().json(customers),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_customer(
    service: web::Data<dyn LogisticsServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match service.get_customer(path.into_inner()).await {
        Ok(customer) => HttpResponse::Ok().json(customer),
        Err(e) => HttpResponse::NotFound().body(e.to_string()),
    }
}

pub async fn delete_customer(
    service: web::Data<dyn LogisticsServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match service.delete_customer(path.into_inner()).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// Jobs
pub async fn create_job(
    service: web::Data<dyn LogisticsServiceTrait>,
    dto: web::Json<CreateTransportJobDto>,
) -> impl Responder {
    match service.create_job(dto.into_inner()).await {
        Ok(job) => HttpResponse::Created().json(job),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_job(
    service: web::Data<dyn LogisticsServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match service.get_job(path.into_inner()).await {
        Ok(job) => HttpResponse::Ok().json(job),
        Err(e) => HttpResponse::NotFound().body(e.to_string()),
    }
}

#[derive(serde::Deserialize)]
pub struct UpdateJobStatusDto {
    status: JobStatus,
}

pub async fn update_job_status(
    service: web::Data<dyn LogisticsServiceTrait>,
    path: web::Path<Uuid>,
    dto: web::Json<UpdateJobStatusDto>,
) -> impl Responder {
    match service.update_job_status(path.into_inner(), dto.status.clone()).await {
        Ok(job) => HttpResponse::Ok().json(job),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// Routes
pub async fn create_route(
    service: web::Data<dyn LogisticsServiceTrait>,
    dto: web::Json<CreateRouteDto>,
) -> impl Responder {
    match service.create_route(dto.into_inner()).await {
        Ok(route) => HttpResponse::Created().json(route),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_job_route(
    service: web::Data<dyn LogisticsServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match service.get_job_route(path.into_inner()).await {
        Ok(route) => HttpResponse::Ok().json(route),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// Shipments
pub async fn create_shipment(
    service: web::Data<dyn LogisticsServiceTrait>,
    dto: web::Json<CreateShipmentDto>,
) -> impl Responder {
    match service.create_shipment(dto.into_inner()).await {
        Ok(shipment) => HttpResponse::Created().json(shipment),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_job_shipments(
    service: web::Data<dyn LogisticsServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    match service.get_job_shipments(path.into_inner()).await {
        Ok(shipments) => HttpResponse::Ok().json(shipments),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/logistics")
            .service(
                web::scope("/customers")
                    .route("", web::post().to(create_customer))
                    .route("", web::get().to(list_customers))
                    .route("/{id}", web::get().to(get_customer))
                    .route("/{id}", web::delete().to(delete_customer))
            )
            .service(
                web::scope("/jobs")
                    .route("", web::post().to(create_job))
                    .route("/{id}", web::get().to(get_job))
                    .route("/{id}/status", web::patch().to(update_job_status))
            )
            .service(
                web::scope("/routes")
                    .route("", web::post().to(create_route))
                    .route("/job/{id}", web::get().to(get_job_route))
            )
            .service(
                web::scope("/shipments")
                    .route("", web::post().to(create_shipment))
                    .route("/job/{id}", web::get().to(get_job_shipments))
            )
    );
}
