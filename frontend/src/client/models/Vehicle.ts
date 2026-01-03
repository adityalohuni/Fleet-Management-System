/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Vehicle = {
    id?: string;
    make?: string;
    model?: string;
    year?: number;
    status?: Vehicle.status;
};
export namespace Vehicle {
    export enum status {
        AVAILABLE = 'Available',
        IN_USE = 'InUse',
        MAINTENANCE = 'Maintenance',
    }
}

