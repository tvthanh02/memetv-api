import { User } from "@/models/index.js";

const userRespositories = {
  insertOne: async (email, password) => {
    try {
      return await User.create({
        email: email,
        password: password,
        role: "Viewer",
        coin: 0,
      });
    } catch (error) {
      throw new Error("Error from insertOne() detail: " + error);
    }
  },

  insertOneWithGoogleId: async (googleId, displayName, avatar, email) => {
    try {
      return await User.create({
        email: email,
        googleId: googleId,
        displayName: displayName,
        avatar: avatar,
        role: "Viewer",
        coin: 0,
      });
    } catch (error) {
      throw new Error("Error from insertOne() detail: " + error);
    }
  },

  findOneFilterField: async (field, value) => {
    try {
      return await User.findOne({ [field]: value }).exec();
    } catch (error) {
      throw new Error("Error from findOneFilteField() detail: " + error);
    }
  },

  getOneById: async (id) => {
    try {
      return await User.findById(id).exec();
    } catch (error) {
      throw new Error("Error from getOneById() detail: " + error);
    }
  },

  isExistEmail: async (email) => {
    try {
      return await User.find({ email: email }).countDocuments().exec();
    } catch (error) {
      throw new Error("Error from isExistEmail() detail: " + error);
    }
  },

  updateOne: async (user) => {
    try {
      if (user instanceof User) {
        await user.save();
        return;
      }
      throw new Error(
        "Error from userRespositories.updateOne() detail: Invalid instance of model"
      );
    } catch (error) {
      throw new Error(
        "Error from userRespositories.updateOne() detail: " + error
      );
    }
  },
};

export default userRespositories;
