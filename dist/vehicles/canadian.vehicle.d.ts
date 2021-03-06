import { REGIONS } from '../constants';
import { VehicleStartOptions, VehicleLocation, VehicleRegisterOptions, VehicleStatus, VehicleOdometer, VehicleStatusOptions, RawVehicleStatus, FullVehicleStatus } from '../interfaces/common.interfaces';
import { SessionController } from '../controllers/controller';
import { Vehicle } from './vehicle';
export default class CanadianVehicle extends Vehicle {
    vehicleConfig: VehicleRegisterOptions;
    controller: SessionController;
    region: REGIONS;
    private timeOffset;
    constructor(vehicleConfig: VehicleRegisterOptions, controller: SessionController);
    fullStatus(): Promise<FullVehicleStatus | null>;
    status(input: VehicleStatusOptions): Promise<VehicleStatus | RawVehicleStatus | null>;
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
