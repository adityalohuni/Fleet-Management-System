/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateVehicleDto = {
    make: string;
    model: string;
    year: number;
    status: CreateVehicleDto.status;
};
export namespace CreateVehicleDto {
    export enum status {
        AVAILABLE = 'Available',
        IN_USE = 'InUse',
        MAINTENANCE = 'Maintenance',
    }
}

