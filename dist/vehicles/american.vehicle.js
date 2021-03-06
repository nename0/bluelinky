"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const logger_1 = __importDefault(require("../logger"));
const constants_1 = require("../constants");
const america_1 = require("../constants/america");
const vehicle_1 = require("./vehicle");
const url_1 = require("url");
class AmericanVehicle extends vehicle_1.Vehicle {
    constructor(vehicleConfig, controller) {
        super(vehicleConfig, controller);
        this.vehicleConfig = vehicleConfig;
        this.controller = controller;
        this.region = constants_1.REGIONS.US;
        logger_1.default.debug(`US Vehicle ${this.vehicleConfig.regId} created`);
    }
    getDefaultHeaders() {
        return {
            'access_token': this.controller.session.accessToken,
            'client_id': america_1.CLIENT_ID,
            'Host': america_1.API_HOST,
            'User-Agent': 'okhttp/3.12.0',
            'registrationId': this.vehicleConfig.regId,
            'gen': this.vehicleConfig.generation,
            'username': this.userConfig.username,
            'vin': this.vehicleConfig.vin,
            'APPCLOUD-VIN': this.vehicleConfig.vin,
            'Language': '0',
            'to': 'ISS',
            'encryptFlag': 'false',
            'from': 'SPA',
            'brandIndicator': this.vehicleConfig.brandIndicator,
            'bluelinkservicepin': this.userConfig.pin,
            'offset': '-5',
        };
    }
    fullStatus() {
        throw new Error('Method not implemented.');
    }
    async odometer() {
        const response = await this._request(`/ac/v2/enrollment/details/${this.userConfig.username}`, {
            method: 'GET',
            headers: { ...this.getDefaultHeaders() },
        });
        if (response.statusCode !== 200) {
            throw 'Failed to get odometer reading!';
        }
        const data = JSON.parse(response.body);
        const foundVehicle = data.enrolledVehicleDetails.find(item => {
            return item.vehicleDetails.vin === this.vin();
        });
        this._odometer = {
            value: foundVehicle.vehicleDetails.odometer,
            unit: 0,
        };
        return this._odometer;
    }
    /**
     * This is seems to always poll the modem directly, no caching
     */
    async location() {
        const response = await this._request('/ac/v2/rcs/rfc/findMyCar', {
            method: 'GET',
            headers: { ...this.getDefaultHeaders() },
        });
        if (response.statusCode !== 200) {
            throw 'Failed to get location!';
        }
        const data = JSON.parse(response.body);
        return {
            latitude: data.coord.lat,
            longitude: data.coord.lon,
            altitude: data.coord.alt,
            speed: {
                unit: data.speed.unit,
                value: data.speed.value,
            },
            heading: data.head,
        };
    }
    async start(startConfig) {
        const mergedConfig = {
            ...{
                airCtrl: false,
                igniOnDuration: 10,
                airTempvalue: 70,
                defrost: false,
                heating1: false,
            },
            ...startConfig,
        };
        const body = {
            'Ims': 0,
            'airCtrl': +mergedConfig.airCtrl,
            'airTemp': {
                'unit': 1,
                'value': `${mergedConfig.airTempvalue}`,
            },
            'defrost': mergedConfig.defrost,
            'heating1': +mergedConfig.heating1,
            'igniOnDuration': mergedConfig.igniOnDuration,
            'seatHeaterVentInfo': null,
            'username': this.userConfig.username,
            'vin': this.vehicleConfig.vin,
        };
        const response = await this._request('/ac/v2/rcs/rsc/start', {
            method: 'POST',
            headers: {
                ...this.getDefaultHeaders(),
                'offset': '-4',
            },
            body: body,
            json: true,
        });
        if (response.statusCode === 200) {
            return 'Vehicle started!';
        }
        return 'Failed to start vehicle';
    }
    async stop() {
        const response = await this._request('/ac/v2/rcs/rsc/stop', {
            method: 'POST',
            headers: {
                ...this.getDefaultHeaders(),
                'offset': '-4',
            },
        });
        if (response.statusCode === 200) {
            return 'Vehicle stopped';
        }
        throw 'Failed to stop vehicle!';
    }
    async status(input) {
        const statusConfig = {
            ...constants_1.DEFAULT_VEHICLE_STATUS_OPTIONS,
            ...input,
        };
        const response = await this._request('/ac/v2/rcs/rvs/vehicleStatus', {
            method: 'GET',
            headers: {
                'REFRESH': statusConfig.refresh.toString(),
                ...this.getDefaultHeaders(),
            },
        });
        const { vehicleStatus } = JSON.parse(response.body);
        const parsedStatus = {
            chassis: {
                hoodOpen: vehicleStatus?.hoodOpen,
                trunkOpen: vehicleStatus?.trunkOpen,
                locked: vehicleStatus?.doorLock,
                openDoors: {
                    frontRight: !!vehicleStatus?.doorOpen?.frontRight,
                    frontLeft: !!vehicleStatus?.doorOpen?.frontLeft,
                    backLeft: !!vehicleStatus?.doorOpen?.backLeft,
                    backRight: !!vehicleStatus?.doorOpen?.backRight,
                },
                tirePressureWarningLamp: {
                    rearLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampRearLeft,
                    frontLeft: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampFrontLeft,
                    frontRight: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampFrontRight,
                    rearRight: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampRearRight,
                    all: !!vehicleStatus?.tirePressureLamp?.tirePressureWarningLampAll,
                },
            },
            climate: {
                active: vehicleStatus?.airCtrlOn,
                steeringwheelHeat: !!vehicleStatus?.steerWheelHeat,
                sideMirrorHeat: false,
                rearWindowHeat: !!vehicleStatus?.sideBackWindowHeat,
                defrost: vehicleStatus?.defrost,
                temperatureSetpoint: vehicleStatus?.airTemp?.value,
                temperatureUnit: vehicleStatus?.airTemp?.unit,
            },
            engine: {
                ignition: vehicleStatus?.engine,
                adaptiveCruiseControl: vehicleStatus?.acc,
                range: vehicleStatus?.dte?.value,
                charging: vehicleStatus?.evStatus?.batteryCharge,
                batteryCharge12v: vehicleStatus?.battery?.batSoc,
                batteryChargeHV: vehicleStatus?.evStatus?.batteryStatus,
            },
        };
        this._status = statusConfig.parsed ? parsedStatus : vehicleStatus;
        return this._status;
    }
    async unlock() {
        const formData = new url_1.URLSearchParams();
        formData.append('userName', this.userConfig.username || '');
        formData.append('vin', this.vehicleConfig.vin);
        const response = await this._request('/ac/v2/rcs/rdo/on', {
            method: 'POST',
            headers: { ...this.getDefaultHeaders() },
            body: formData.toString(),
        });
        if (response.statusCode === 200) {
            return 'Unlock successful';
        }
        return 'Something went wrong!';
    }
    async lock() {
        const formData = new url_1.URLSearchParams();
        formData.append('userName', this.userConfig.username || '');
        formData.append('vin', this.vehicleConfig.vin);
        const response = await this._request('/ac/v2/rcs/rdo/off', {
            method: 'POST',
            headers: { ...this.getDefaultHeaders() },
            body: formData.toString(),
        });
        if (response.statusCode === 200) {
            return 'Lock successful';
        }
        return 'Something went wrong!';
    }
    async startCharge() {
        const response = await this._request(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`, {
            method: 'POST',
        });
        if (response.statusCode === 200) {
            logger_1.default.debug(`Send start charge command to Vehicle ${this.vehicleConfig.id}`);
            return 'Start charge successful';
        }
        throw 'Something went wrong!';
    }
    async stopCharge() {
        const response = await got_1.default(`/api/v2/spa/vehicles/${this.vehicleConfig.id}/control/charge`, {
            method: 'POST',
        });
        if (response.statusCode === 200) {
            logger_1.default.debug(`Send stop charge command to vehicle ${this.vehicleConfig.id}`);
            return 'Stop charge successful';
        }
        throw 'Something went wrong!';
    }
    // TODO: not sure how to type a dynamic response
    /* eslint-disable @typescript-eslint/no-explicit-any */
    async _request(service, options) {
        // add logic for token refresh if to ensure we don't use a stale token
        await this.controller.refreshAccessToken();
        // if we refreshed token make sure to apply it to the request
        options.headers.access_token = this.controller.session.accessToken;
        const response = await got_1.default(`${america_1.BASE_URL}/${service}`, { throwHttpErrors: false, ...options });
        if (response?.body) {
            logger_1.default.debug(response.body);
        }
        return response;
    }
}
exports.default = AmericanVehicle;
//# sourceMappingURL=american.vehicle.js.map