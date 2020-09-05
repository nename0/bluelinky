export interface BlueLinkyConfig {
    username: string | undefined;
    password: string | undefined;
    region: string | undefined;
    autoLogin?: boolean;
    pin: string | undefined;
    vin?: string | undefined;
    vehicleId?: string | undefined;
}
export interface BluelinkVehicle {
    name: string;
    vin: string;
    type: string;
}
export interface Session {
    accessToken?: string;
    refreshToken?: string;
    controlToken?: string;
    deviceId?: string;
    tokenExpiresAt: number;
    controlTokenExpiresAt?: number;
}
export interface VehicleStatus {
    engine: {
        ignition: boolean;
        batteryCharge?: number;
        charging?: boolean;
        timeToFullCharge?: unknown;
        range: number;
        adaptiveCruiseControl: boolean;
    };
    climate: {
        active: boolean;
        steeringwheelHeat: boolean;
        sideMirrorHeat: boolean;
        rearWindowHeat: boolean;
        temperatureSetpoint: number;
        temperatureUnit: number;
        defrost: boolean;
    };
    chassis: {
        hoodOpen: boolean;
        trunkOpen: boolean;
        locked: boolean;
        openDoors: {
            frontRight: boolean;
            frontLeft: boolean;
            backLeft: boolean;
            backRight: boolean;
        };
        tirePressureWarningLamp: {
            rearLeft: boolean;
            frontLeft: boolean;
            frontRight: boolean;
            rearRight: boolean;
            all: boolean;
        };
    };
}
export interface RawVehicleStatus {
    lastStatusDate: string;
    dateTime: string;
    acc: boolean;
    trunkOpen: boolean;
    doorLock: boolean;
    defrostStatus: string;
    transCond: boolean;
    doorLockStatus: string;
    doorOpen: {
        frontRight: number;
        frontLeft: number;
        backLeft: number;
        backRight: number;
    };
    airCtrlOn: boolean;
    airTempUnit: string;
    airTemp: {
        unit: number;
        hvacTempType: number;
        value: string;
    };
    battery: {
        batSignalReferenceValue: unknown;
        batSoc: number;
        batState: number;
        sjbDeliveryMode: number;
    };
    ign3: boolean;
    ignitionStatus: string;
    lowFuelLight: boolean;
    sideBackWindowHeat: number;
    dte: {
        unit: number;
        value: number;
    };
    engine: boolean;
    defrost: boolean;
    hoodOpen: boolean;
    airConditionStatus: string;
    steerWheelHeat: number;
    tirePressureLamp: {
        tirePressureWarningLampRearLeft: number;
        tirePressureWarningLampFrontLeft: number;
        tirePressureWarningLampFrontRight: number;
        tirePressureWarningLampAll: number;
        tirePressureWarningLampRearRight: number;
    };
    trunkOpenStatus: string;
    evStatus: {
        batteryCharge: boolean;
        batteryStatus: number;
        batteryPlugin: number;
        remainTime2: {
            etc1: {
                value: number;
                unit: number;
            };
            etc2: {
                value: number;
                unit: number;
            };
            etc3: {
                value: number;
                unit: number;
            };
            atc: {
                value: number;
                unit: number;
            };
        };
        drvDistance: [{
            rangeByFuel: {
                gasModeRange: {
                    value: number;
                    unit: number;
                };
                evModeRange: {
                    value: number;
                    unit: number;
                };
                totalAvailableRange: {
                    value: number;
                    unit: number;
                };
            };
            type: number;
        }];
    };
    remoteIgnition: boolean;
    seatHeaterVentInfo: unknown;
    sleepModeCheck: boolean;
    lampWireStatus: {
        headLamp: unknown;
        stopLamp: unknown;
        turnSignalLamp: unknown;
    };
    windowOpen: unknown;
    engineRuntime: unknown;
}
export interface VehicleInfo {
    vehicleId: string;
    nickName: string;
    modelCode: string;
    modelName: string;
    modelYear: string;
    fuelKindCode: string;
    trim: string;
    engine: string;
    exteriorColor: string;
    dtcCount: number;
    subscriptionStatus: string;
    subscriptionEndDate: string;
    overviewMessage: string;
    odometer: number;
    odometerUnit: number;
    defaultVehicle: boolean;
    enrollmentStatus: string;
    genType: string;
    transmissionType: string;
    vin: string;
}
export interface VehicleFeatures {
    seatHeatVent: {
        drvSeatHeatOption: number;
        astSeatHeatOption: number;
        rlSeatHeatOption: number;
        rrSeatHeatOption: number;
    };
    hvacTempType: number;
    targetMinSoc: number;
}
export interface VehicleFeatureEntry {
    category: string;
    features: [{
        featureName: string;
        features: [{
            subFeatureName: string;
            subFeatureValue: string;
        }];
    }];
}
export interface VehicleFeaturesModel {
    features: [VehicleFeatureEntry];
}
export interface VehicleInfoResponse {
    vehicleInfo: VehicleInfo;
    features: VehicleFeatures;
    featuresModel: VehicleFeaturesModel;
    status: VehicleStatus;
}
export interface VehicleLocation {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: {
        unit: number;
        value: number;
    };
    heading: number;
}
export interface LegacyVehicleLocation {
    accuracy: {
        hdop: number;
        pdop: number;
    };
    coord: {
        alt: number;
        lat: number;
        lon: number;
        type: number;
    };
    head: number;
    speed: {
        unit: number;
        value: number;
    };
    time: string;
}
export interface VehicleOdometer {
    unit: number;
    value: number;
}
export interface VehicleStatusOptions {
    refresh: boolean;
    parsed: boolean;
}
export interface VehicleNextService {
    msopServiceOdometer: number;
    msopServiceOdometerUnit: number;
    mtspServiceDate: string;
    imatServiceOdometer: number;
    imatServiceOdometerUnit: number;
    mtitServiceDate: string;
    currentOdometer: number;
    currentOdometerUnit: number;
    serviceOdometerDuration: number;
    serviceDaysDuration: number;
    serviceMonthsThreshold: number;
}
export interface VehicleCommandResponse {
    responseCode: number;
    responseDesc: string;
}
export interface VehicleStartOptions {
    airCtrl?: boolean | string;
    igniOnDuration: number;
    airTempvalue?: number;
    defrost?: boolean | string;
    heating1?: boolean | string;
}
export interface VehicleClimateOptions {
    defrost: boolean;
    windscreenHeating: boolean;
    temperature: number;
    unit: string;
}
export interface VehicleRegisterOptions {
    nickname: string;
    name: string;
    vin: string;
    regDate: string;
    brandIndicator: string;
    regId: string;
    id: string;
    generation: string;
}
export interface Address {
    street: string;
    city: string;
    province: string;
    postalCode: string;
}
export interface AccountInfo {
    firstName: string;
    lastName: string;
    notificationEmail: string;
    phones: {
        primary: string | null;
        secondary: string | null;
    };
    addresses: {
        primary: Address | null;
        secondary: Address | null;
    };
    preference: {
        odometerUnit: number;
        climateUnit: string;
        languageId: number;
        maintenanceAlert: boolean;
        preferredDealer: PreferedDealer | null;
        promotionMessage: string | null;
    };
}
export interface PreferedDealerHour {
    dayCode: number;
    startTime: string;
    startTimeUnit: string;
    endTime: string;
    endTimeUnit: string;
}
export interface PreferedDealer {
    dealerCode: string;
    dealerName: string;
    street: string;
    province: string;
    city: string;
    postalCode: string;
    tel: string;
    fax: string;
    fullAddress: string;
    distance: string;
    lat: string;
    lng: string;
    webSite: string;
    salesHourList: [PreferedDealerHour];
    serviceHourList: [PreferedDealerHour];
}
