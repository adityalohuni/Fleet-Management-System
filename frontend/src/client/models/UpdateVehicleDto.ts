/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateVehicleDto = {
    make?: string;
    model?: string;
    year?: number;
    status?: UpdateVehicleDto.status;
};
export namespace UpdateVehicleDto {
    export enum status {
        AVAILABLE = 'Available',
        IN_USE = 'InUse',
        MAINTENANCE = 'Maintenance',
    }
}

