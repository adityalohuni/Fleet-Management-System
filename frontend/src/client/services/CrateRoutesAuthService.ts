/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { Claims } from '../models/Claims';
import type { CreateUserDto } from '../models/CreateUserDto';
import type { LoginDto } from '../models/LoginDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CrateRoutesAuthService {
    /**
     * @param requestBody
     * @returns AuthResponse User logged in successfully
     * @throws ApiError
     */
    public static login(
        requestBody: LoginDto,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * @returns Claims Current user info
     * @throws ApiError
     */
    public static me(): CancelablePromise<Claims> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns AuthResponse User registered successfully
     * @throws ApiError
     */
    public static register(
        requestBody: CreateUserDto,
    ): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `Internal Server Error`,
            },
        });
    }
}
