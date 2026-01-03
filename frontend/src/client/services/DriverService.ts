/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDriverDto } from '../models/CreateDriverDto';
import type { Driver } from '../models/Driver';
import type { UpdateDriverDto } from '../models/UpdateDriverDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DriverService {
    /**
     * @returns Driver List of drivers
     * @throws ApiError
     */
    public static getDrivers(): CancelablePromise<Array<Driver>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/drivers',
        });
    }
    /**
     * @param requestBody
     * @returns Driver Driver created
     * @throws ApiError
     */
    public static createDriver(
        requestBody?: CreateDriverDto,
    ): CancelablePromise<Driver> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/drivers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns Driver Driver details
     * @throws ApiError
     */
    public static getDriverById(
        id: string,
    ): CancelablePromise<Driver> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/drivers/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Driver Driver updated
     * @throws ApiError
     */
    public static updateDriver(
        id: string,
        requestBody?: UpdateDriverDto,
    ): CancelablePromise<Driver> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/drivers/{id}',
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
    public static deleteDriver(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/drivers/{id}',
            path: {
                'id': id,
            },
        });
    }
}
