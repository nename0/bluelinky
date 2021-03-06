import { VehicleStatusOptions } from './interfaces/common.interfaces';
export declare const ALL_ENDPOINTS: {
    CA: {
        login: string;
        logout: string;
        vehicleList: string;
        vehicleInfo: string;
        status: string;
        remoteStatus: string;
        lock: string;
        unlock: string;
        start: string;
        stop: string;
        locate: string;
        hornlight: string;
        verifyAccountToken: string;
        verifyPin: string;
        verifyToken: string;
    };
    EU: {
        session: string;
        login: string;
        language: string;
        redirectUri: string;
        token: string;
    };
};
export declare const GEN2 = 2;
export declare const GEN1 = 1;
export declare enum REGIONS {
    US = "US",
    CA = "CA",
    EU = "EU"
}
export declare const DEFAULT_VEHICLE_STATUS_OPTIONS: VehicleStatusOptions;