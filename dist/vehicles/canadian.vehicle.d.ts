import { REGIONS } from '../constants';
import { VehicleStartOptions, VehicleInfoResponse, VehicleLocation, VehicleRegisterOptions, VehicleNextService, VehicleStatus, VehicleOdometer, VehicleStatusOptions, RawVehicleStatus } from '../interfaces/common.interfaces';
import { SessionController } from '../controllers/controller';
import { Vehicle } from './vehicle';
export default class CanadianVehicle extends Vehicle {
    vehicleConfig: VehicleRegisterOptions;
    controller: SessionController;
    private _nextService;
    private _info;
    private _features;
    private _featuresModel;
    region: REGIONS;
    private timeOffset;
    constructor(vehicleConfig: VehicleRegisterOptions, controller: SessionController);
    vehicleInfo(): Promise<VehicleInfoResponse>;
    status(input: VehicleStatusOptions): Promise<VehicleStatus | RawVehicleStatus | null>;
    nextService(): Promise<VehicleNextService>;
    lock(): Promise<string>;
    unlock(): Promise<string>;
    start(startConfig: VehicleStartOptions): Promise<string>;
    stop(): Promise<string>;
    lights(withHorn?: boolean): Promise<string>;
    odometer(): Promise<VehicleOdometer | null>;
    location(): Promise<VehicleLocation>;
    private getPreAuth;
    private request;
}
