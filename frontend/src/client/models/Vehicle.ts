/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FuelType } from './FuelType';
import type { VehicleStatus } from './VehicleStatus';
import type { VehicleType } from './VehicleType';
export type Vehicle = {
    created_at: string;
    current_mileage: number;
    deleted_at?: string | null;
    fuel_type: FuelType;
    id: string;
    license_plate: string;
    make: string;
    model: string;
    specs?: any;
    status: VehicleStatus;
    type: VehicleType;
    updated_at: string;
    vin: string;
    year: number;
};

