import { BlacklistToken } from "@/models/index.js";

const blacklistTokenRepositories = {
  insertOne: async (accessToken, refreshToken) => {
    try {
      await BlacklistToken.create({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      throw new Error(
        "Error from blacklistTokenRepositories.insertOne() detail: " + error
      );
    }
  },

  findOneFilterField: async (field, value) => {
    try {
      return await BlacklistToken.findOne({ [field]: value }).exec();
    } catch (error) {
      throw new Error(
        "Error from blacklistTokenRepositories.findOneFilterField() detail: " +
          error
      );
    }
  },
};

export default blacklistTokenRepositories;
