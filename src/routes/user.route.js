import express from "express";
import jwt from "jsonwebtoken";
import { CommonMiddleware, UserMiddleware } from "@/middleware/index.js";
import { UserController } from "@/controllers/index.js";
import { Key } from "@/constants/index.js";
import passport from "passport";
import { CustomError } from "@/utils/index.js";
import "dotenv/config";

const userRouter = express.Router();

userRouter.get("/", CommonMiddleware.loggedIn, (req, res) => {
  res.send(`<h1>User</h1>`);
});

userRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "https://www.googleapis.com/auth/userinfo.email"],
    session: false,
  })
);

userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  async (req, res) => {
    const { googleId, displayName, avatar_url, email } = req.user;

    try {
      const { accessToken, refreshToken } =
        await UserController.loginOauthGoogle(
          googleId,
          email,
          avatar_url,
          displayName
        );
      res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none").send(`
        <html>
          <body>
            <script>
                window.onload = function() {
                  window.opener.postMessage({
                    accessToken: '${accessToken}',
                    refreshToken: '${refreshToken}'
                  }, '${process.env.FRONTEND_URL}');
                  window.close();
                }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: "An error has occurred " + error,
      });
    }
  }
);

userRouter.post(
  "/login",
  UserMiddleware.isValidFieldAuthen,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const { accessToken, refreshToken } = await UserController.login(
        email,
        password
      );

      if (!accessToken || !refreshToken) {
        res.status(400).json({
          error: 1,
          message: "Email or password incorrect!",
        });
        return;
      }

      res.status(200).json({
        error: 0,
        message: "Logged In!!!",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: "Internal server error",
      });
    }
  }
);

userRouter.post(
  "/register",
  UserMiddleware.isValidFieldAuthen,
  async (req, res) => {
    const { email, password } = req.body;

    try {
      await UserController.register(email, password);
      res.status(201).json("Created new account!");
    } catch (error) {
      if (error instanceof CustomError.BadRequest) {
        res.status(400).json({
          error: 1,
          message: "" + error,
        });
      } else {
        res.status(500).json({
          error: 1,
          message: "Internal Server Error",
        });
      }
    }
  }
);

// streamer

export default userRouter;
