/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MonthlyFinancialSummary } from '../models/MonthlyFinancialSummary';
import type { VehicleProfitability } from '../models/VehicleProfitability';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FinancialService {
    /**
     * @returns MonthlyFinancialSummary Monthly financial summary
     * @throws ApiError
     */
    public static getMonthlySummary(): CancelablePromise<Array<MonthlyFinancialSummary>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/financial/summary',
        });
    }
    /**
     * @returns VehicleProfitability Vehicle profitability
     * @throws ApiError
     */
    public static getVehicleProfitability(): CancelablePromise<Array<VehicleProfitability>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/financial/vehicle-profitability',
        });
    }
}
