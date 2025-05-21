import { PinataSDK } from "pinata";

import getEnvConfig from "../configs/index.js";

let pinata: PinataSDK;

const initPinata = () => {
  pinata = new PinataSDK({
    pinataJwt: getEnvConfig().PINATA_JWT,
    pinataGateway: getEnvConfig().PINATA_GATEWAY_URL,
  });
};

const getPinataSDK = () => {
  if (!pinata) {
    initPinata();
  }
  return pinata;
};

export default getPinataSDK;
