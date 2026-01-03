use std::sync::Arc;
use uuid::Uuid;
use async_trait::async_trait;
use crate::error::AppError;
use crate::models::postgres::logistics::{
    Customer, CreateCustomerDto,
    TransportJob, CreateTransportJobDto, JobStatus,
    Route, CreateRouteDto,
    Shipment, CreateShipmentDto
};
use crate::repositories::postgres::logistics_repo::{
    CustomerRepositoryTrait, TransportJobRepositoryTrait, RouteRepositoryTrait, ShipmentRepositoryTrait
};

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait LogisticsServiceTrait: Send + Sync {
    // Customer
    async fn create_customer(&self, dto: CreateCustomerDto) -> Result<Customer, AppError>;
    async fn get_customer(&self, id: Uuid) -> Result<Customer, AppError>;
    async fn list_customers(&self) -> Result<Vec<Customer>, AppError>;
    async fn delete_customer(&self, id: Uuid) -> Result<(), AppError>;

    // Transport Job
    async fn create_job(&self, dto: CreateTransportJobDto) -> Result<TransportJob, AppError>;
    async fn list_jobs(&self) -> Result<Vec<TransportJob>, AppError>;
    async fn get_job(&self, id: Uuid) -> Result<TransportJob, AppError>;
    async fn update_job_status(&self, id: Uuid, status: JobStatus) -> Result<TransportJob, AppError>;

    // Route
    async fn create_route(&self, dto: CreateRouteDto) -> Result<Route, AppError>;
    async fn get_job_route(&self, job_id: Uuid) -> Result<Option<Route>, AppError>;

    // Shipment
    async fn create_shipment(&self, dto: CreateShipmentDto) -> Result<Shipment, AppError>;
    async fn get_job_shipments(&self, job_id: Uuid) -> Result<Vec<Shipment>, AppError>;
}

pub struct LogisticsService {
    customer_repo: Arc<dyn CustomerRepositoryTrait>,
    job_repo: Arc<dyn TransportJobRepositoryTrait>,
    route_repo: Arc<dyn RouteRepositoryTrait>,
    shipment_repo: Arc<dyn ShipmentRepositoryTrait>,
}

impl LogisticsService {
    pub fn new(
        customer_repo: Arc<dyn CustomerRepositoryTrait>,
        job_repo: Arc<dyn TransportJobRepositoryTrait>,
        route_repo: Arc<dyn RouteRepositoryTrait>,
        shipment_repo: Arc<dyn ShipmentRepositoryTrait>,
    ) -> Self {
        Self {
            customer_repo,
            job_repo,
            route_repo,
            shipment_repo,
        }
    }
}

#[async_trait]
impl LogisticsServiceTrait for LogisticsService {
    // Customer
    async fn create_customer(&self, dto: CreateCustomerDto) -> Result<Customer, AppError> {
        self.customer_repo.create(dto).await
    }

    async fn get_customer(&self, id: Uuid) -> Result<Customer, AppError> {
        self.customer_repo.find_by_id(id).await?
            .ok_or(AppError::NotFound("Customer not found".into()))
    }

    async fn list_customers(&self) -> Result<Vec<Customer>, AppError> {
        self.customer_repo.find_all().await
    }

    async fn delete_customer(&self, id: Uuid) -> Result<(), AppError> {
        self.customer_repo.delete(id).await
    }

    // Transport Job
    async fn create_job(&self, dto: CreateTransportJobDto) -> Result<TransportJob, AppError> {
        self.job_repo.create(dto).await
    }

    async fn list_jobs(&self) -> Result<Vec<TransportJob>, AppError> {
        self.job_repo.find_all().await
    }

    async fn get_job(&self, id: Uuid) -> Result<TransportJob, AppError> {
        self.job_repo.find_by_id(id).await?
            .ok_or(AppError::NotFound("Transport Job not found".into()))
    }

    async fn update_job_status(&self, id: Uuid, status: JobStatus) -> Result<TransportJob, AppError> {
        self.job_repo.update_status(id, status).await
    }

    // Route
    async fn create_route(&self, dto: CreateRouteDto) -> Result<Route, AppError> {
        self.route_repo.create(dto).await
    }

    async fn get_job_route(&self, job_id: Uuid) -> Result<Option<Route>, AppError> {
        self.route_repo.find_by_job_id(job_id).await
    }

    // Shipment
    async fn create_shipment(&self, dto: CreateShipmentDto) -> Result<Shipment, AppError> {
        self.shipment_repo.create(dto).await
    }

    async fn get_job_shipments(&self, job_id: Uuid) -> Result<Vec<Shipment>, AppError> {
        self.shipment_repo.find_by_job_id(job_id).await
    }
}
