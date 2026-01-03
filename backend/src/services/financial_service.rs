use std::sync::Arc;
use async_trait::async_trait;
use crate::models::postgres::financial::{MonthlyFinancialSummary, VehicleProfitability};
use crate::repositories::postgres::financial_repo::FinancialRepository;
use crate::error::AppError;

#[async_trait]
pub trait FinancialServiceTrait: Send + Sync {
    async fn get_monthly_summary(&self) -> Result<Vec<MonthlyFinancialSummary>, AppError>;
    async fn get_vehicle_profitability(&self) -> Result<Vec<VehicleProfitability>, AppError>;
}

pub struct FinancialService {
    repo: Arc<FinancialRepository>,
}

impl FinancialService {
    pub fn new(repo: Arc<FinancialRepository>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl FinancialServiceTrait for FinancialService {
    async fn get_monthly_summary(&self) -> Result<Vec<MonthlyFinancialSummary>, AppError> {
        self.repo.get_monthly_summary().await
    }

    async fn get_vehicle_profitability(&self) -> Result<Vec<VehicleProfitability>, AppError> {
        self.repo.get_vehicle_profitability().await
    }
}
