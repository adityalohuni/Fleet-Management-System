use actix_web::{web, HttpResponse, Responder};
use uuid::Uuid;
use crate::models::postgres::assignment::{CreateAssignmentDto, AssignmentStatus};
use crate::services::assignment_service::AssignmentServiceTrait;
use crate::error::AppError;

pub async fn list_assignments(service: web::Data<dyn AssignmentServiceTrait>) -> Result<impl Responder, AppError> {
    let assignments = service.list_assignments().await?;
    Ok(HttpResponse::Ok().json(assignments))
}

pub async fn get_assignment(
    service: web::Data<dyn AssignmentServiceTrait>,
    path: web::Path<Uuid>,
) -> Result<impl Responder, AppError> {
    let id = path.into_inner();
    let assignment = service.get_assignment(id).await?;
    Ok(HttpResponse::Ok().json(assignment))
}

pub async fn create_assignment(
    service: web::Data<dyn AssignmentServiceTrait>,
    dto: web::Json<CreateAssignmentDto>,
) -> Result<impl Responder, AppError> {
    let assignment = service.create_assignment(dto.into_inner()).await?;
    Ok(HttpResponse::Created().json(assignment))
}

#[derive(serde::Deserialize)]
pub struct UpdateAssignmentDto {
    pub status: Option<AssignmentStatus>,
    pub end_time: Option<String>,
}

pub async fn update_assignment(
    service: web::Data<dyn AssignmentServiceTrait>,
    path: web::Path<Uuid>,
    _dto: web::Json<UpdateAssignmentDto>,
) -> Result<impl Responder, AppError> {
    let id = path.into_inner();
    // For now, just complete the assignment
    // TODO: Implement proper update logic for different statuses
    let assignment = service.complete_assignment(id).await?;
    Ok(HttpResponse::Ok().json(assignment))
}

pub async fn complete_assignment(
    service: web::Data<dyn AssignmentServiceTrait>,
    path: web::Path<Uuid>,
) -> Result<impl Responder, AppError> {
    let id = path.into_inner();
    let assignment = service.complete_assignment(id).await?;
    Ok(HttpResponse::Ok().json(assignment))
}

pub async fn get_driver_assignments(
    service: web::Data<dyn AssignmentServiceTrait>,
    path: web::Path<Uuid>,
) -> Result<impl Responder, AppError> {
    let driver_id = path.into_inner();
    let assignments = service.get_assignments_by_driver(driver_id).await?;
    Ok(HttpResponse::Ok().json(assignments))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/assignments")
            .route("", web::get().to(list_assignments))
            .route("", web::post().to(create_assignment))
            .route("/{id}", web::get().to(get_assignment))
            .route("/{id}", web::put().to(update_assignment))
            .route("/{id}/complete", web::patch().to(complete_assignment))
            .route("/driver/{driver_id}", web::get().to(get_driver_assignments))
    );
}
