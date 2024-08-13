import { UserService } from "@/services/index.js";
import liveSessions from "../../store.js";

// common:

const userController = {
  // email + password
  register: async (email, password) => {
    return await UserService.registerWithEmailAndPassword(email, password);
  },

  login: async (email, password) => {
    // check valid login
    const user = await UserService.signInWithEmailAndPassword(email, password);
    // generate accessToken, refreshToken
    if (user) {
      const accessToken = JWT.createAccessToken({
        uid: user._id,
      });
      const refreshToken = JWT.createRefreshToken({
        uid: user._id,
      });

      return { accessToken, refreshToken };
    }
  },

  logout: async (accessToken, refreshToken) => {
    try {
      await UserService.logoutWithBlacklistToken(accessToken, refreshToken);
    } catch (error) {
      throw error;
    }
  },

  getNewAccessToken: (payload) => {
    return JWT.createAccessToken(payload);
  },

  // google, facebook (passportjs)
  loginOauthGoogle: async (googleId, email, avatar, displayName) => {
    try {
      // user existed
      const existedUser = await UserService.checkUserExistedWithField(
        "googleId",
        googleId
      );

      if (existedUser) {
        const [accessToken, refreshToken] = [
          JWT.createAccessToken({ uid: existedUser._id }),
          JWT.createRefreshToken({ uid: existedUser._id }),
        ];
        if (accessToken && refreshToken) {
          return {
            accessToken,
            refreshToken,
          };
        }
        // user not existed
      } else {
        const newUser = await UserService.createUserWithGoogle(
          googleId,
          displayName,
          avatar,
          email
        );
        if (newUser) {
          const [accessToken, refreshToken] = [
            JWT.createAccessToken({ uid: newUser._id }),
            JWT.createRefreshToken({ uid: newUser._id }),
          ];
          if (accessToken && refreshToken) {
            return {
              accessToken,
              refreshToken,
            };
          }
        }
      }
    } catch (error) {
      throw error;
    }
  },

  // update info profile
  updateInfo: async (
    uid,
    avatar = "",
    displayName = "",
    firstName = "",
    lastName = "",
    wasborn = "",
    phoneNumber = ""
  ) => {
    try {
      await UserService.updateProfileUser(uid, {
        avatar,
        displayName,
        firstName,
        lastName,
        wasborn,
        phoneNumber,
      });
    } catch (error) {
      throw error;
    }
  },

  // - watch live

  // - give a gift

  // - follow streamer

  // - recharge coin

  // - watch restream

  // ******* Viewer:
  // - register become streamer

  //***** streamer:

  // - live
  startLive: (streamerId, thumbnail, tag, title) => {
    const streamKey = Generate.generateStreamkey();

    liveSessions[streamKey] = {
      streamerId,
      thumbnail,
      tag,
      title,
    };

    return streamKey;
  },
  // - ban user

  // admin:
  // - accept form become a streamer
  // - ban streamer
  // - create event
};

export default userController;
