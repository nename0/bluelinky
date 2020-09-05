"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VEHICLE_STATUS_OPTIONS = exports.REGIONS = exports.GEN1 = exports.GEN2 = exports.ALL_ENDPOINTS = void 0;
// moved all the US constants to its own file, we can use this file for shared constants
const canada_1 = require("./constants/canada");
const europe_1 = require("./constants/europe");
exports.ALL_ENDPOINTS = {
    CA: canada_1.CA_ENDPOINTS,
    EU: europe_1.EU_ENDPOINTS,
};
exports.GEN2 = 2;
exports.GEN1 = 1;
var REGIONS;
(function (REGIONS) {
    REGIONS["US"] = "US";
    REGIONS["CA"] = "CA";
    REGIONS["EU"] = "EU";
})(REGIONS = exports.REGIONS || (exports.REGIONS = {}));
exports.DEFAULT_VEHICLE_STATUS_OPTIONS = {
    refresh: false,
    parsed: false,
};
//# sourceMappingURL=constants.js.map