/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Driver = {
    id?: string;
    name?: string;
    status?: Driver.status;
    license_number?: string;
};
export namespace Driver {
    export enum status {
        ACTIVE = 'Active',
        INACTIVE = 'Inactive',
        ON_LEAVE = 'OnLeave',
    }
}

