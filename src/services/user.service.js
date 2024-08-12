import {
  UserRespository,
  BlacklistTokenRespository,
} from "@/respositories/index.js";
import { BcryptJS } from "@/utils/index.js";
import { CustomError } from "@/utils/index.js";

const userServices = {
  registerWithEmailAndPassword: async (email, password) => {
    try {
      const rows = await UserRespository.isExistEmail(email);
      if (rows && rows > 0) {
        throw new CustomError.BadRequest("This email existed");
      }
      const hashPassword = BcryptJS.hash(password);
      try {
        await UserRespository.insertOne(email, hashPassword);
        return 1;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  signInWithEmailAndPassword: async (email, password) => {
    try {
      const account = await UserRespository.findOneFilterField("email", email);
      if (account) {
        const hashPassword = account.password;
        let isValidPassword = BcryptJS.compare(password, hashPassword);
        if (!isValidPassword) {
          throw new Error("Password invalid!");
        }
        return account;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error("Account not exist " + error);
    }
  },

  logoutWithBlacklistToken: async (accessToken, refreshToken) => {
    try {
      await BlacklistTokenRespository.insertOne(accessToken, refreshToken);
    } catch (error) {
      throw error;
    }
  },

  createUserWithGoogle: async (googleId, displayName, avatar, email) => {
    try {
      const rows = await UserRespository.isExistEmail(email);
      if (rows > 0) {
        throw new Error("Email existed!");
      }

      return await UserRespository.insertOneWithGoogleId(
        googleId,
        displayName,
        avatar,
        email
      );
    } catch (error) {
      throw error;
    }
  },

  checkUserExistedWithField: async (field, fieldValue) => {
    try {
      const user = await UserRespository.findOneFilterField(field, fieldValue);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw error;
    }
  },

  updateProfileUser: async (userId, infoUpdate) => {
    const { avatar, displayName, firstName, lastName, wasborn, phoneNumber } =
      infoUpdate;

    const user = await UserRespository.getOneById(userId);

    if (!user) {
      throw new CustomError.NotFound("Not found user. Please check!");
    }
    avatar && (user.avatar = avatar);
    displayName && (user.displayName = displayName);
    firstName && (user.firstName = firstName);
    lastName && (user.lastName = lastName);
    wasborn && (user.wasborn = wasborn);
    phoneNumber && (user.phoneNumber = phoneNumber);

    try {
      await UserRespository.updateOne(user);
    } catch (error) {
      throw error;
    }
  },
};

export default userServices;
