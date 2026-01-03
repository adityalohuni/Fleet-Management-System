/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateVehicleDto } from '../models/CreateVehicleDto';
import type { UpdateVehicleDto } from '../models/UpdateVehicleDto';
import type { Vehicle } from '../models/Vehicle';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VehicleService {
    /**
     * @returns Vehicle List of vehicles
     * @throws ApiError
     */
    public static getVehicles(): CancelablePromise<Array<Vehicle>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/vehicles',
        });
    }
    /**
     * @param requestBody
     * @returns Vehicle Vehicle created
     * @throws ApiError
     */
    public static createVehicle(
        requestBody?: CreateVehicleDto,
    ): CancelablePromise<Vehicle> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/vehicles',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns Vehicle Vehicle details
     * @throws ApiError
     */
    public static getVehicleById(
        id: string,
    ): CancelablePromise<Vehicle> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/vehicles/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Vehicle Vehicle updated
     * @throws ApiError
     */
    public static updateVehicle(
        id: string,
        requestBody?: UpdateVehicleDto,
    ): CancelablePromise<Vehicle> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/vehicles/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteVehicle(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/vehicles/{id}',
            path: {
                'id': id,
            },
        });
    }
}
