"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmericanController = void 0;
const got_1 = __importDefault(require("got"));
const american_vehicle_1 = __importDefault(require("../vehicles/american.vehicle"));
const controller_1 = require("./controller");
const logger_1 = __importDefault(require("../logger"));
const america_1 = require("../constants/america");
class AmericanController extends controller_1.SessionController {
    constructor(userConfig) {
        super(userConfig);
        this.vehicles = [];
        logger_1.default.debug(`US Controller created`);
    }
    async refreshAccessToken() {
        const shouldRefreshToken = Math.floor(+new Date() / 1000 - this.session.tokenExpiresAt) <= 10;
        if (this.session.refreshToken && shouldRefreshToken) {
            logger_1.default.debug('refreshing token');
            const response = await got_1.default(`${america_1.BASE_URL}/v2/ac/oauth/token/refresh`, {
                method: 'POST',
                body: {
                    'refresh_token': this.session.refreshToken,
                },
                headers: {
                    'client_secret': america_1.CLIENT_SECRET,
                    'client_id': america_1.CLIENT_ID,
                },
                json: true,
            });
            this.session.accessToken = response.body.access_token;
            this.session.refreshToken = response.body.refresh_token;
            this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + parseInt(response.body.expires_in));
            return Promise.resolve('Token refreshed');
        }
        return Promise.resolve('Token not expired, no need to refresh');
    }
    // TODO: come up with a better return value?
    async login() {
        logger_1.default.debug('Logging in to API');
        const response = await got_1.default(`${america_1.BASE_URL}/v2/ac/oauth/token`, {
            method: 'POST',
            body: {
                username: this.userConfig.username,
                password: this.userConfig.password,
            },
            headers: {
                'client_secret': america_1.CLIENT_SECRET,
                'client_id': america_1.CLIENT_ID,
            },
            json: true,
        });
        if (response.statusCode !== 200) {
            return Promise.reject('login bad');
        }
        this.session.accessToken = response.body.access_token;
        this.session.refreshToken = response.body.refresh_token;
        this.session.tokenExpiresAt = Math.floor(+new Date() / 1000 + parseInt(response.body.expires_in));
        return Promise.resolve('login good');
    }
    async logout() {
        return Promise.resolve('OK');
    }
    async getVehicles() {
        const response = await got_1.default(`${america_1.BASE_URL}/ac/v2/enrollment/details/${this.userConfig.username}`, {
            method: 'GET',
            headers: {
                'access_token': this.session.accessToken,
                'client_id': america_1.CLIENT_ID,
                'Host': america_1.API_HOST,
                'User-Agent': 'okhttp/3.12.0',
                'payloadGenerated': '20200226171938',
                'includeNonConnectedVehicles': 'Y',
            },
        });
        const data = JSON.parse(response.body);
        if (data.enrolledVehicleDetails === undefined) {
            this.vehicles = [];
            return Promise.resolve(this.vehicles);
        }
        data.enrolledVehicleDetails.forEach(vehicle => {
            const vehicleInfo = vehicle.vehicleDetails;
            const vehicleConfig = {
                nickname: vehicleInfo.nickName,
                name: vehicleInfo.nickName,
                vin: vehicleInfo.vin,
                regDate: vehicleInfo.enrollmentDate,
                brandIndicator: vehicleInfo.brandIndicator,
                regId: vehicleInfo.regid,
                generation: vehicleInfo.modelYear > 2016 ? '2' : '1',
            };
            this.vehicles.push(new american_vehicle_1.default(vehicleConfig, this));
        });
        return Promise.resolve(this.vehicles);
    }
}
exports.AmericanController = AmericanController;
//# sourceMappingURL=american.controller.js.map