use actix_web::{test, web, App};
use fleet_management_backend::routes::financial;
use fleet_management_backend::models::postgres::financial::{MonthlyFinancialSummary, VehicleProfitability};
use fleet_management_backend::services::financial_service::FinancialServiceTrait;
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;
use rust_decimal::Decimal;

mock! {
    pub FinancialService {}

    #[async_trait]
    impl FinancialServiceTrait for FinancialService {
        async fn get_monthly_summary(&self) -> Result<Vec<MonthlyFinancialSummary>, AppError>;
        async fn get_vehicle_profitability(&self) -> Result<Vec<VehicleProfitability>, AppError>;
    }
}

#[actix_web::test]
async fn test_get_monthly_summary() {
    let mut mock_service = MockFinancialService::new();

    let expected_summary = vec![
        MonthlyFinancialSummary {
            month: "2024-01".to_string(),
            revenue: Decimal::new(10000, 0),
            cost: Decimal::new(2000, 0),
            profit: Decimal::new(8000, 0),
        }
    ];

    // Clone for the closure
    let return_summary = expected_summary.into_iter().map(|s| MonthlyFinancialSummary {
        month: s.month.clone(),
        revenue: s.revenue,
        cost: s.cost,
        profit: s.profit,
    }).collect::<Vec<_>>();

    mock_service
        .expect_get_monthly_summary()
        .times(1)
        .returning(move || Ok(return_summary.iter().map(|s| MonthlyFinancialSummary {
            month: s.month.clone(),
            revenue: s.revenue,
            cost: s.cost,
            profit: s.profit,
        }).collect()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn FinancialServiceTrait>))
            .configure(financial::config)
    ).await;

    let req = test::TestRequest::get()
        .uri("/financial/summary")
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_get_vehicle_profitability() {
    let mut mock_service = MockFinancialService::new();
    let vehicle_id = Uuid::new_v4();

    let expected_profitability = vec![
        VehicleProfitability {
            vehicle_id,
            vehicle_plate: "ABC-123".to_string(),
            revenue: Decimal::new(0, 0),
            cost: Decimal::new(500, 0),
            profit: Decimal::new(-500, 0),
            rank: 1,
        }
    ];

    // Clone for the closure
    let return_profitability = expected_profitability.into_iter().map(|p| VehicleProfitability {
        vehicle_id: p.vehicle_id,
        vehicle_plate: p.vehicle_plate.clone(),
        revenue: p.revenue,
        cost: p.cost,
        profit: p.profit,
        rank: p.rank,
    }).collect::<Vec<_>>();

    mock_service
        .expect_get_vehicle_profitability()
        .times(1)
        .returning(move || Ok(return_profitability.iter().map(|p| VehicleProfitability {
            vehicle_id: p.vehicle_id,
            vehicle_plate: p.vehicle_plate.clone(),
            revenue: p.revenue,
            cost: p.cost,
            profit: p.profit,
            rank: p.rank,
        }).collect()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn FinancialServiceTrait>))
            .configure(financial::config)
    ).await;

    let req = test::TestRequest::get()
        .uri("/financial/vehicle-profitability")
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
