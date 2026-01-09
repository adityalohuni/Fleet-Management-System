/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FuelType } from './FuelType';
import type { VehicleType } from './VehicleType';
export type CreateVehicleDto = {
    current_mileage: number;
    fuel_type: FuelType;
    license_plate: string;
    make: string;
    model: string;
    specs?: any;
    type: VehicleType;
    vin: string;
    year: number;
};

