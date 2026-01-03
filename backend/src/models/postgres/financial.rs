use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use rust_decimal::Decimal;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct MonthlyFinancialSummary {
    pub month: String, // Format: "YYYY-MM"
    #[schema(value_type = String)]
    pub revenue: Decimal,
    #[schema(value_type = String)]
    pub cost: Decimal,
    #[schema(value_type = String)]
    pub profit: Decimal,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct VehicleProfitability {
    pub vehicle_id: Uuid,
    pub vehicle_plate: String, // Need to join with vehicles table
    #[schema(value_type = String)]
    pub revenue: Decimal,
    #[schema(value_type = String)]
    pub cost: Decimal,
    #[schema(value_type = String)]
    pub profit: Decimal,
    pub rank: i32,
}
