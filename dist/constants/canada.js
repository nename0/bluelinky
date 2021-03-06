"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CA_ENDPOINTS = exports.CLIENT_ORIGIN = exports.CA_BASE_URL = exports.CA_API_HOST = void 0;
// Kia seems to use myuvo.ca as mentioned by @wcomartin
// forks can modify some things to make this work
exports.CA_API_HOST = 'mybluelink.ca';
exports.CA_BASE_URL = `https://${exports.CA_API_HOST}`;
exports.CLIENT_ORIGIN = 'SPA';
exports.CA_ENDPOINTS = {
    login: `${exports.CA_BASE_URL}/tods/api/lgn`,
    logout: `${exports.CA_BASE_URL}/tods/api/lgout`,
    // Vehicle
    vehicleList: `${exports.CA_BASE_URL}/tods/api/vhcllst`,
    vehicleInfo: `${exports.CA_BASE_URL}/tods/api/sltvhcl`,
    status: `${exports.CA_BASE_URL}/tods/api/lstvhclsts`,
    remoteStatus: `${exports.CA_BASE_URL}/tods/api/rltmvhclsts`,
    // Car commands with preauth (PIN)
    lock: `${exports.CA_BASE_URL}/tods/api/drlck`,
    unlock: `${exports.CA_BASE_URL}/tods/api/drulck`,
    start: `${exports.CA_BASE_URL}/tods/api/evc/rfon`,
    stop: `${exports.CA_BASE_URL}/tods/api/evc/rfoff`,
    locate: `${exports.CA_BASE_URL}/tods/api/fndmcr`,
    hornlight: `${exports.CA_BASE_URL}/tods/api/hornlight`,
    // System
    verifyAccountToken: `${exports.CA_BASE_URL}/tods/api/vrfyacctkn`,
    verifyPin: `${exports.CA_BASE_URL}/tods/api/vrfypin`,
    verifyToken: `${exports.CA_BASE_URL}/tods/api/vrfytnc`,
};
//# sourceMappingURL=canada.js.map