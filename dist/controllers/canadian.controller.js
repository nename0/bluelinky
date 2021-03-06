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
        this.vehicles = [];
        this.timeOffset = -(new Date().getTimezoneOffset() / 60);
        logger_1.default.debug('CA Controller created');
    }
    async refreshAccessToken() {
        const shouldRefreshToken = Math.floor(Date.now() / 1000 - this.session.tokenExpiresAt) >= -10;
        logger_1.default.debug('shouldRefreshToken: ' + shouldRefreshToken.toString());
        if (this.session.refreshToken && shouldRefreshToken) {
            // TODO: someone should find the refresh token API url then we dont have to do this hack
            // the previously used CA_ENDPOINTS.verifyToken did not refresh it only provided if the token was valid
            await this.login();
            logger_1.default.debug('Token refreshed');
            return 'Token refreshed';
        }
        logger_1.default.debug('Token not expired, no need to refresh');
        return 'Token not expired, no need to refresh';
    }
    async login() {
        logger_1.default.info('Begin login request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.login, {
                loginId: this.userConfig.username,
                password: this.userConfig.password,
            });
            logger_1.default.debug(response.result);
            this.session.accessToken = response.result.accessToken;
            this.session.refreshToken = response.result.refreshToken;
            this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + response.result.expireIn);
            return 'login good';
        }
        catch (err) {
            return 'error: ' + err;
        }
    }
    async logout() {
        return 'OK';
    }
    async getVehicles() {
        logger_1.default.info('Begin getVehicleList request');
        try {
            const response = await this.request(canada_1.CA_ENDPOINTS.vehicleList, {});
            const data = response.result;
            if (data.vehicles === undefined) {
                this.vehicles = [];
                return this.vehicles;
            }
            data.vehicles.forEach(vehicle => {
                const vehicleConfig = {
                    nickname: vehicle.nickName,
                    name: vehicle.nickName,
                    vin: vehicle.vin,
                    regDate: vehicle.enrollmentDate,
                    brandIndicator: vehicle.brandIndicator,
                    regId: vehicle.regid,
                    id: vehicle.vehicleId,
                    generation: vehicle.genType,
                };
                this.vehicles.push(new canadian_vehicle_1.default(vehicleConfig, this));
            });
            return this.vehicles;
        }
        catch (err) {
            logger_1.default.debug(err);
            return this.vehicles;
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
                throw response.body.responseHeader.responseDesc;
            }
            return response.body;
        }
        catch (err) {
            throw err.message;
        }
    }
}
exports.CanadianController = CanadianController;
//# sourceMappingURL=canadian.controller.js.map