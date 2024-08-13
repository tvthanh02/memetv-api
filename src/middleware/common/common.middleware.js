import jwt from "jsonwebtoken";
import { Key } from "@/constants/index.js";
import { User } from "@/models/index.js";
import { BlacklistTokenRespository } from "@/respositories/index.js";

const commonMiddleware = {
  loggedIn: async (req, res, next) => {
    // check has accessToken
    const authorization = req.headers.authorization;
    if (!authorization)
      res.status(401).json({
        error: 1,
        message: "Unauthorized",
      });

    // check valid token
    const accessToken = authorization.replace(/\s/gm, "").slice(6);

    const accessTokenDisabled =
      await BlacklistTokenRespository.findOneFilterField(
        "accessToken",
        accessToken
      );
    if (accessTokenDisabled) {
      res.status(401).json({
        error: 1,
        message: "Unauthorized",
      });
      return;
    }

    try {
      const decoded = jwt.verify(accessToken, Key.publicKey);

      if (!decoded) {
        res.status(401).json({
          error: 1,
          message: "Unauthorized",
        });
        return;
      }

      req.headers.payload = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        error: 1,
        message: "Token expired",
      });
    }
  },

  isStreamer: async (req, res, next) => {
    // logged
    const payload = req.headers.payload;
    if (!payload)
      res.status(401).json({
        error: 1,
        message: "Unauthorized",
      });
    // role user
    const { uid } = payload;
    try {
      const currentUser = await User.findById(uid).exec();
      console.log(currentUser);
      if (!["idol", "game"].includes(currentUser.role)) {
        res.status(403).json({
          error: 1,
          message: "Forbidden",
        });
        return;
      }
      next();
    } catch (e) {
      res.status(500).json({
        error: 1,
        message: "Internal Server Error",
      });
    }
  },

  isAdmin: async (req, res, next) => {
    // logged
    const payload = req.headers.payload;
    if (!payload)
      res.status(401).json({
        error: 1,
        message: "Unauthorized",
      });
    // role user
    const { uid } = payload;
    try {
      const currentUser = await User.findById(uid).exec();
      if (currentUser.role !== "Admin") {
        res.status(403).json({
          error: 1,
          message: "Forbidden",
        });
        return;
      }
      next();
    } catch (e) {
      res.status(500).json({
        error: 1,
        message: "Internal Server Error",
      });
    }
  },
};

export default commonMiddleware;
