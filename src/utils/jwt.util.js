import fs from "fs";
import jwt from "jsonwebtoken";
import { Key } from "@/constants/index.js";

const jwtApi = {
  createAccessToken: (payload, options) => {
    return jwt.sign(payload, Key.privateKey, {
      ...options,
      algorithm: "RS256",
      expiresIn: 30 * 60, // 30 minutes
    });
  },

  createRefreshToken: (payload, options) => {
    return jwt.sign(payload, Key.privateKey, {
      ...options,
      algorithm: "RS256",
      expiresIn: "7d",
    });
  },
};

export default jwtApi;
