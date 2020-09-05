"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanadianController = void 0;
const got_1 = __importDefault(require("got"));
const canada_1 = require("../constants/canada");
const canadian_vehicle_1 = __importDefault(require("../vehicles/canadian.vehicle"));
const controller_1 = require("./controller");
const logger_1 = __importDefault(require("../logger"));
class CanadianController extends controller_1.SessionController {
    constructor(userConfig) {
        super(userConfig);
        this._preferredDealer = null;
        this._accountInfo = null;
        this.vehicles = [];
        this.timeOffset = -(new Date().getTimezoneOffset() / 60);
        logger_1.default.debug('CA Controller created');
    }
    async refreshAccessToken() {
        const shouldRefreshToken = Math.floor(+new Date() / 1000 - this.session.tokenExpiresAt) <= 10;
        if (this.session.refreshToken && shouldRefreshToken) {
            // TODO , right call ?
            const response = await this.request(canada_1.CA_ENDPOINTS.verifyToken, {}, {});
            this.session.accessToken = response.body.access_token;
            this.session.refreshToken = response.body.refresh_token;
            this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + response.body.expires_in);
            return Promise.resolve('Token refreshed');
        }
        return Promise.resolve('Token not expired, no need to refresh');
    }
    async login() {
        logger_1.default.info('Begin login request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.login, {
                loginId: this.userConfig.username,
                password: this.userConfig.password,
            });
            this.session.accessToken = response.result.accessToken;
            this.session.refreshToken = response.result.refreshToken;
            this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + response.result.expireIn);
            return Promise.resolve('login good');
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    logout() {
        return Promise.resolve('OK');
    }
    async getVehicles() {
        logger_1.default.info('Begin getVehicleList request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.vehicleList, {});
            const data = response.result;
            if (data.vehicles === undefined) {
                this.vehicles = [];
                return Promise.resolve(this.vehicles);
            }
            data.vehicles.forEach(vehicle => {
                const vehicleConfig = {
                    nickname: vehicle.nickName,
                    name: vehicle.nickName,
                    vin: vehicle.vin,
                    regDate: vehicle.enrollmentDate,
                    brandIndicator: vehicle.brandIndicator,
                    regId: vehicle.regid,
                    generation: vehicle.genType,
                };
                this.vehicles.push(new canadian_vehicle_1.default(vehicleConfig, this));
            });
            return Promise.resolve(this.vehicles);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    // Account
    //////////////////////////////////////////////////////////////////////////////
    // TODO: deprecated account specific data
    async myAccount() {
        logger_1.default.info('Begin myAccount request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.myAccount, {});
            this._accountInfo = response.result;
            return Promise.resolve(this._accountInfo);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    async preferedDealer() {
        logger_1.default.info('Begin preferedDealer request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.preferedDealer, {});
            this._preferredDealer = response.result;
            return Promise.resolve(this._preferredDealer);
        }
        catch (err) {
            return Promise.reject('error: ' + err);
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    // Internal
    //////////////////////////////////////////////////////////////////////////////
    // TODO: not quite sure how to type this if it's dynamic?
    /* eslint-disable @typescript-eslint/no-explicit-any */
    async request(endpoint, body, headers = {}) {
        logger_1.default.debug(`[${endpoint}] ${JSON.stringify(headers)} ${JSON.stringify(body)}`);
        try {
            const response = await got_1.default(endpoint, {
                method: 'POST',
                json: true,
                headers: {
                    from: canada_1.CLIENT_ORIGIN,
                    language: 1,
                    offset: this.timeOffset,
                    accessToken: this.session.accessToken,
                    ...headers,
                },
                body: {
                    ...body,
                },
            });
            if (response.body.responseHeader.responseCode != 0) {
                return Promise.reject('bad request: ' + response.body.responseHeader.responseDesc);
            }
            return Promise.resolve(response.body);
        }
        catch (err) {
            logger_1.default.error(err.message);
            return Promise.reject('error: ' + err);
        }
    }
}
exports.CanadianController = CanadianController;
//# sourceMappingURL=canadian.controller.js.map