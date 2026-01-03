use actix_web::{web, HttpResponse, Responder};
use uuid::Uuid;
use crate::models::postgres::assignment::CreateAssignmentDto;
use crate::services::assignment_service::AssignmentServiceTrait;

pub async fn list_assignments(service: web::Data<dyn AssignmentServiceTrait>) -> impl Responder {
    let result = service.list_assignments().await;
    match result {
        Ok(assignments) => HttpResponse::Ok().json(assignments),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_assignment(
    service: web::Data<dyn AssignmentServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    let result = service.get_assignment(id).await;
    match result {
        Ok(assignment) => HttpResponse::Ok().json(assignment),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn create_assignment(
    service: web::Data<dyn AssignmentServiceTrait>,
    dto: web::Json<CreateAssignmentDto>,
) -> impl Responder {
    let result = service.create_assignment(dto.into_inner()).await;
    match result {
        Ok(assignment) => HttpResponse::Created().json(assignment),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn complete_assignment(
    service: web::Data<dyn AssignmentServiceTrait>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    let result = service.complete_assignment(id).await;
    match result {
        Ok(assignment) => HttpResponse::Ok().json(assignment),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/assignments")
            .route("", web::get().to(list_assignments))
            .route("", web::post().to(create_assignment))
            .route("/{id}", web::get().to(get_assignment))
            .route("/{id}/complete", web::patch().to(complete_assignment))
    );
}
