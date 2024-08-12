import mongoose from "mongoose";
import { Schema } from "mongoose";

const BlacklistToken = mongoose.model(
  "BlacklistToken",
  new Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
  })
);

export default BlacklistToken;
