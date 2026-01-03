/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateDriverDto = {
    name?: string;
    status?: UpdateDriverDto.status;
    license_number?: string;
};
export namespace UpdateDriverDto {
    export enum status {
        ACTIVE = 'Active',
        INACTIVE = 'Inactive',
        ON_LEAVE = 'OnLeave',
    }
}

