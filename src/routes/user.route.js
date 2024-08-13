import express from "express";
import jwt from "jsonwebtoken";
import { CommonMiddleware, UserMiddleware } from "@/middleware/index.js";
import { UserController } from "@/controllers/index.js";
import { Key } from "@/constants/index.js";
import passport from "passport";
import { CustomError } from "@/utils/index.js";
import "dotenv/config";
import { MomoService } from "@/services/index.js";

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
          message: "Internal Server Error " + error,
        });
      }
    }
  }
);

userRouter.post(
  "/give-gift",
  CommonMiddleware.loggedIn,
  UserMiddleware.isValidCoinWhenGiveGift,
  async (req, res) => {
    const { liveId, itemId } = req.body;
    const { uid } = req.headers.payload;

    try {
      const giftOrlistGift = await UserController.giveAGift(
        liveId,
        uid,
        itemId
      );
      res.status(200).json({
        error: 0,
        message: "Send success " + giftOrlistGift,
      });
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: "Internal server error " + error,
      });
    }
  }
);

userRouter.post("/follow", CommonMiddleware.loggedIn, async (req, res) => {
  const { uid } = req.headers.payload;
  const { streamerId } = req.body;

  if (!streamerId) {
    res.status(400).json({
      error: 1,
      message: "Bad request",
    });
    return;
  }

  try {
    const streamer = await UserController.followStreamer(uid, streamerId);
    res.status(200).json({
      error: 0,
      message: "Followd " + streamer,
    });
  } catch (error) {
    res.status(500).json({
      error: 1,
      message: "Internal server error " + error,
    });
  }
});

// recharge coin

userRouter.post("/payment", CommonMiddleware.loggedIn, async (req, res) => {
  const { uid } = req.headers.payload;
  const { rechargePackageId } = req.body;

  if (!rechargePackageId) {
    res.status(400).json({
      error: 1,
      message: "Bad request",
    });
    return;
  }

  try {
    const paymentCreateResult = await UserController.rechargeCoin(
      uid,
      rechargePackageId
    );
    res.status(200).json(paymentCreateResult);
  } catch (error) {
    res.status(500).json({
      error: 1,
      message: "Internal server error " + error,
    });
  }
});

userRouter.post("/payment/callback", async (req, res) => {
  const { orderId, transId, resultCode } = req.body;

  try {
    const paymentStatus = resultCode === 0 ? "paid" : "fail";
    await MomoService.ipnConfirmTransaction(orderId, transId, paymentStatus);
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 1,
      message: "Internal server error " + error,
    });
  }

  /* 
    {
  // save partnerCode: 'MOMO',
  // save orderId: 'MOMO1723532313180',
  // save requestId: 'MOMO1723532313180',
  amount: 50000,
  orderInfo: 'MEME TV',
  orderType: 'momo_wallet',
  // save transId: 4099085803,
  // save resultCode: 0,
  message: 'Successful.',
  payType: 'napas',
  responseTime: 1723532378216,
  extraData: '',
  signature: '39013a5c16de35e4450ee3b9651110bb1266c28052bc6d7c12498d3d5134e52a'
} 
  */
});

// streamer

userRouter.post(
  "/create-live",
  CommonMiddleware.loggedIn,
  CommonMiddleware.isStreamer,
  (req, res) => {
    const { uid } = req.headers.payload;
    const { title, thumbnail, tag } = req.body;

    if (!title || !thumbnail || !tag) {
      res.status(400).json({
        error: 1,
        message: "Bad request",
      });
      return;
    }

    const stream_key = UserController.startLive(uid, thumbnail, tag, title);

    res.status(200).json(stream_key);
  }
);

userRouter.post(
  "/ban-user",
  CommonMiddleware.loggedIn,
  CommonMiddleware.isStreamer,
  async (req, res) => {
    const { uid } = req.headers.payload;
    const { userId } = req.body;

    if (!uid || !userId) {
      res.status(400).json({
        error: 1,
        message: "Bad request",
      });
      return;
    }

    try {
      const result = await UserController.ban(uid, userId);
      res.status(200).json({
        error: 0,
        message:
          "Banned " +
          result.bans.find(
            (bannedUserId) => bannedUserId.user.toString() === userId
          ),
      });
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: "Internal server error " + error,
      });
    }
  }
);

export default userRouter;
