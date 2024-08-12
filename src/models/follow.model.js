import mongoose from "mongoose";
import { Schema } from "mongoose";

/*
followerId
followeeId
createdAt

*/

const Follow = mongoose.model(
  "Follow",
  new Schema(
    {
      follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
      followee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
  )
);

export default Follow;
