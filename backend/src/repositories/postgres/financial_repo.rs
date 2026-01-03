use sqlx::PgPool;
use crate::models::postgres::financial::{MonthlyFinancialSummary, VehicleProfitability};
use crate::error::AppError;

pub struct FinancialRepository {
    pool: PgPool,
}

impl FinancialRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn get_monthly_summary(&self) -> Result<Vec<MonthlyFinancialSummary>, AppError> {
        let query = r#"
            WITH monthly_revenue AS (
                SELECT 
                    TO_CHAR(updated_at, 'YYYY-MM') as month, 
                    SUM(agreed_price) as revenue 
                FROM transport_jobs 
                WHERE status = 'PAID' 
                GROUP BY 1
            ),
            monthly_cost AS (
                SELECT 
                    TO_CHAR(date, 'YYYY-MM') as month, 
                    SUM(cost) as cost 
                FROM maintenance_records 
                GROUP BY 1
            )
            SELECT 
                COALESCE(r.month, c.month) as month,
                COALESCE(r.revenue, 0) as revenue,
                COALESCE(c.cost, 0) as cost,
                (COALESCE(r.revenue, 0) - COALESCE(c.cost, 0)) as profit
            FROM monthly_revenue r
            FULL OUTER JOIN monthly_cost c ON r.month = c.month
            ORDER BY month DESC
        "#;

        let summaries = sqlx::query_as::<_, MonthlyFinancialSummary>(query)
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(summaries)
    }

    pub async fn get_vehicle_profitability(&self) -> Result<Vec<VehicleProfitability>, AppError> {
        // Note: Currently revenue is not linked to vehicles, so we only track costs.
        let query = r#"
            WITH vehicle_costs AS (
                SELECT 
                    vehicle_id, 
                    SUM(cost) as cost 
                FROM maintenance_records 
                GROUP BY vehicle_id
            )
            SELECT 
                v.id as vehicle_id,
                v.license_plate as vehicle_plate,
                0::numeric as revenue,
                COALESCE(c.cost, 0) as cost,
                (0 - COALESCE(c.cost, 0)) as profit,
                RANK() OVER (ORDER BY (0 - COALESCE(c.cost, 0)) DESC)::integer as rank
            FROM vehicles v
            LEFT JOIN vehicle_costs c ON v.id = c.vehicle_id
            ORDER BY profit DESC
        "#;

        let profitability = sqlx::query_as::<_, VehicleProfitability>(query)
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(profitability)
    }
}
