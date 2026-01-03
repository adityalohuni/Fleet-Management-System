use sqlx::PgPool;
use uuid::Uuid;
use crate::models::postgres::logistics::{
    Customer, CreateCustomerDto,
    TransportJob, CreateTransportJobDto, JobStatus,
    Route, CreateRouteDto,
    Shipment, CreateShipmentDto
};
use crate::error::AppError;
use async_trait::async_trait;

// --- Customer Repository ---
#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait CustomerRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateCustomerDto) -> Result<Customer, AppError>;
    async fn find_all(&self) -> Result<Vec<Customer>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Customer>, AppError>;
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;
}

pub struct CustomerRepository {
    pool: PgPool,
}

impl CustomerRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl CustomerRepositoryTrait for CustomerRepository {
    async fn create(&self, dto: CreateCustomerDto) -> Result<Customer, AppError> {
        let id = Uuid::new_v4();
        let customer = sqlx::query_as::<_, Customer>(
            r#"
            INSERT INTO customers (
                id, name, contact_info, billing_address, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.name)
        .bind(dto.contact_info)
        .bind(dto.billing_address)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(customer)
    }

    async fn find_all(&self) -> Result<Vec<Customer>, AppError> {
        let customers = sqlx::query_as::<_, Customer>(
            "SELECT * FROM customers WHERE deleted_at IS NULL"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(customers)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Customer>, AppError> {
        let customer = sqlx::query_as::<_, Customer>(
            "SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(customer)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE customers SET deleted_at = NOW() WHERE id = $1"
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Customer with id {} not found", id)));
        }

        Ok(())
    }
}

// --- TransportJob Repository ---
#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait TransportJobRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateTransportJobDto) -> Result<TransportJob, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<TransportJob>, AppError>;
    async fn update_status(&self, id: Uuid, status: JobStatus) -> Result<TransportJob, AppError>;
}

pub struct TransportJobRepository {
    pool: PgPool,
}

impl TransportJobRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TransportJobRepositoryTrait for TransportJobRepository {
    async fn create(&self, dto: CreateTransportJobDto) -> Result<TransportJob, AppError> {
        let id = Uuid::new_v4();
        let job = sqlx::query_as::<_, TransportJob>(
            r#"
            INSERT INTO transport_jobs (
                id, customer_id, status, agreed_price, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.customer_id)
        .bind(dto.status)
        .bind(dto.agreed_price)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(job)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<TransportJob>, AppError> {
        let job = sqlx::query_as::<_, TransportJob>(
            "SELECT * FROM transport_jobs WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(job)
    }

    async fn update_status(&self, id: Uuid, status: JobStatus) -> Result<TransportJob, AppError> {
        let job = sqlx::query_as::<_, TransportJob>(
            r#"
            UPDATE transport_jobs 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
            "#
        )
        .bind(status)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(job)
    }
}

// --- Route Repository ---
#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait RouteRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateRouteDto) -> Result<Route, AppError>;
    async fn find_by_job_id(&self, job_id: Uuid) -> Result<Option<Route>, AppError>;
}

pub struct RouteRepository {
    pool: PgPool,
}

impl RouteRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl RouteRepositoryTrait for RouteRepository {
    async fn create(&self, dto: CreateRouteDto) -> Result<Route, AppError> {
        let id = Uuid::new_v4();
        // We need to cast JSONB to Geometry using ST_GeomFromGeoJSON
        // And when returning, cast Geometry to JSONB using ST_AsGeoJSON
        let route = sqlx::query_as::<_, Route>(
            r#"
            INSERT INTO routes (
                id, job_id, origin, destination, waypoints
            )
            VALUES (
                $1, 
                $2, 
                ST_SetSRID(ST_GeomFromGeoJSON($3::jsonb), 4326), 
                ST_SetSRID(ST_GeomFromGeoJSON($4::jsonb), 4326), 
                CASE WHEN $5::jsonb IS NULL THEN NULL ELSE ST_SetSRID(ST_GeomFromGeoJSON($5::jsonb), 4326) END
            )
            RETURNING 
                id, 
                job_id, 
                ST_AsGeoJSON(origin)::jsonb as origin, 
                ST_AsGeoJSON(destination)::jsonb as destination, 
                ST_AsGeoJSON(waypoints)::jsonb as waypoints
            "#
        )
        .bind(id)
        .bind(dto.job_id)
        .bind(dto.origin)
        .bind(dto.destination)
        .bind(dto.waypoints)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(route)
    }

    async fn find_by_job_id(&self, job_id: Uuid) -> Result<Option<Route>, AppError> {
        let route = sqlx::query_as::<_, Route>(
            r#"
            SELECT 
                id, 
                job_id, 
                ST_AsGeoJSON(origin)::jsonb as origin, 
                ST_AsGeoJSON(destination)::jsonb as destination, 
                ST_AsGeoJSON(waypoints)::jsonb as waypoints
            FROM routes 
            WHERE job_id = $1
            "#
        )
        .bind(job_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(route)
    }
}

// --- Shipment Repository ---
#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait ShipmentRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateShipmentDto) -> Result<Shipment, AppError>;
    async fn find_by_job_id(&self, job_id: Uuid) -> Result<Vec<Shipment>, AppError>;
}

pub struct ShipmentRepository {
    pool: PgPool,
}

impl ShipmentRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl ShipmentRepositoryTrait for ShipmentRepository {
    async fn create(&self, dto: CreateShipmentDto) -> Result<Shipment, AppError> {
        let id = Uuid::new_v4();
        let shipment = sqlx::query_as::<_, Shipment>(
            r#"
            INSERT INTO shipments (
                id, job_id, weight, dimensions, type
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.job_id)
        .bind(dto.weight)
        .bind(dto.dimensions)
        .bind(dto.r#type)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(shipment)
    }

    async fn find_by_job_id(&self, job_id: Uuid) -> Result<Vec<Shipment>, AppError> {
        let shipments = sqlx::query_as::<_, Shipment>(
            "SELECT * FROM shipments WHERE job_id = $1"
        )
        .bind(job_id)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(shipments)
    }
}
