/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Assignment } from '../models/Assignment';
import type { CreateAssignmentDto } from '../models/CreateAssignmentDto';
import type { UpdateAssignmentDto } from '../models/UpdateAssignmentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssignmentService {
    /**
     * @returns Assignment List of assignments
     * @throws ApiError
     */
    public static getAssignments(): CancelablePromise<Array<Assignment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/assignments',
        });
    }
    /**
     * @param requestBody
     * @returns Assignment Assignment created
     * @throws ApiError
     */
    public static createAssignment(
        requestBody?: CreateAssignmentDto,
    ): CancelablePromise<Assignment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/assignments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Assignment Assignment updated
     * @throws ApiError
     */
    public static updateAssignment(
        id: string,
        requestBody?: UpdateAssignmentDto,
    ): CancelablePromise<Assignment> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/assignments/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
