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
                    COALESCE(SUM(agreed_price), 0)::decimal as revenue 
                FROM transport_jobs 
                GROUP BY TO_CHAR(updated_at, 'YYYY-MM')
            ),
            monthly_cost AS (
                SELECT 
                    TO_CHAR(date, 'YYYY-MM') as month, 
                    COALESCE(SUM(cost), 0)::decimal as cost 
                FROM maintenance_records 
                WHERE date IS NOT NULL
                GROUP BY TO_CHAR(date, 'YYYY-MM')
            ),
            all_months AS (
                SELECT month FROM monthly_revenue
                UNION
                SELECT month FROM monthly_cost
            )
            SELECT 
                m.month,
                COALESCE(r.revenue, 0) as revenue,
                COALESCE(c.cost, 0) as cost,
                (COALESCE(r.revenue, 0) - COALESCE(c.cost, 0)) as profit
            FROM all_months m
            LEFT JOIN monthly_revenue r ON m.month = r.month
            LEFT JOIN monthly_cost c ON m.month = c.month
            ORDER BY m.month DESC
        "#;

        let summaries = sqlx::query_as::<_, MonthlyFinancialSummary>(query)
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(summaries)
    }

    pub async fn get_vehicle_profitability(&self) -> Result<Vec<VehicleProfitability>, AppError> {
        let query = r#"
            WITH vehicle_costs AS (
                SELECT 
                    vehicle_id, 
                    COALESCE(SUM(cost), 0)::decimal as total_maintenance_cost
                FROM maintenance_records 
                WHERE vehicle_id IS NOT NULL
                GROUP BY vehicle_id
            )
            SELECT 
                v.id as vehicle_id,
                v.license_plate as vehicle_plate,
                0::decimal as revenue,
                COALESCE(c.total_maintenance_cost, 0)::decimal as cost,
                (0::decimal - COALESCE(c.total_maintenance_cost, 0)::decimal) as profit,
                RANK() OVER (ORDER BY (0::decimal - COALESCE(c.total_maintenance_cost, 0)::decimal) DESC)::integer as rank
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
