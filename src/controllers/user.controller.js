import { MomoService, UserService } from "@/services/index.js";
import { Generate, JWT } from "@/utils/index.js";
import liveSessions from "../../store.js";
import { GiftOfLive, Banned, Gift, Follow } from "@/models/index.js";
import { UserRespository } from "@/respositories/index.js";

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

  giveAGift: async (liveId, senderId, itemId) => {
    const [liveInGiveAGift, gift] = await Promise.all([
      GiftOfLive.findOne({ liveId: liveId }).exec(),
      Gift.findById(itemId).exec(),
    ]);
    if (liveInGiveAGift) {
      // check sender exist
      const giftSenderGave = liveInGiveAGift.gifts.find(
        (gift) => gift.sender.toString() === senderId
      );

      if (giftSenderGave) {
        giftSenderGave.items.push({
          giftId: itemId,
          coin: gift.coin,
        });
        await liveInGiveAGift.save();
        return giftSenderGave;
      }

      liveInGiveAGift.gifts.push({
        sender: senderId,
        items: [
          {
            giftId: itemId,
            coin: gift.coin,
          },
        ],
      });
      await liveInGiveAGift.save();
      return {
        sender: senderId,
        items: {
          giftId: itemId,
          coin: gift.coin,
        },
      };
    } else {
      return await GiftOfLive.create({
        liveId: liveId,
        gifts: [
          {
            sender: senderId,
            items: {
              giftId: itemId,
              coin: gift.coin,
            },
          },
        ],
      });
    }
  },

  // - follow streamer
  followStreamer: async (followerId, streamerId) => {
    // only follow streamer
    const [streamer, listOfFollower] = await Promise.all([
      UserRespository.getOneById(streamerId),
      Follow.find({ follower: followerId }).exec(),
    ]);
    if (followerId === streamerId) {
      throw new Error("Invalid recursive follow");
    }
    if (!["idol", "game"].includes(streamer.role)) {
      throw new Error("Feature only available with follow streamer");
    }
    // haven't follow before
    if (
      listOfFollower
        .map((item) => item.followee.toString())
        .includes(streamerId)
    ) {
      throw new Error("This streamer has been followed before");
    }

    await Follow.create({
      follower: followerId,
      followee: streamerId,
    });

    return streamer.displayName;
  },

  // - recharge coin

  rechargeCoin: async (userId, rechargePackageId) => {
    // receive payment link
    const paymentLink = await MomoService.createTransaction(
      userId,
      rechargePackageId
    );
    return paymentLink;
  },

  // - watch restream

  // ******* Viewer:
  // - register become streamer
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

  ban: async (streamerId, userId) => {
    const listBannedOfStreamer = await Banned.findOne({
      streamer: streamerId,
    }).exec();

    if (listBannedOfStreamer) {
      const isUserBanned = listBannedOfStreamer.bans.find(
        (userBannedId) => userBannedId.user.toString() === userId
      );

      if (isUserBanned) {
        throw new Error("This user has been banned before");
      }

      listBannedOfStreamer.bans.push({
        user: userId,
      });
      await listBannedOfStreamer.save();
      return listBannedOfStreamer;
    }

    const newListBannedOfStreamer = await Banned.create({
      streamer: streamerId,
      bans: [{ user: userId }],
    });

    return newListBannedOfStreamer;
  },

  // admin:
  // - accept form become a streamer
  // - ban streamer
  // - create event
};

export default userController;
