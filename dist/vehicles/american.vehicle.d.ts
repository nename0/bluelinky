import { REGIONS } from '../constants';
import { SessionController } from '../controllers/controller';
import { VehicleStartOptions, VehicleStatus, VehicleLocation, VehicleRegisterOptions, VehicleOdometer, RawVehicleStatus, VehicleStatusOptions } from '../interfaces/common.interfaces';
import { Vehicle } from './vehicle';
export default class AmericanVehicle extends Vehicle {
    vehicleConfig: VehicleRegisterOptions;
    controller: SessionController;
    region: REGIONS;
    constructor(vehicleConfig: VehicleRegisterOptions, controller: SessionController);
    private getDefaultHeaders;
    odometer(): Promise<VehicleOdometer | null>;
    /**
     * This is seems to always poll the modem directly, no caching
     */
    location(): Promise<VehicleLocation>;
    start(startConfig: VehicleStartOptions): Promise<string>;
    stop(): Promise<string>;
    status(input: VehicleStatusOptions): Promise<VehicleStatus | RawVehicleStatus | null>;
    unlock(): Promise<string>;
    lock(): Promise<string>;
    private _request;
}
