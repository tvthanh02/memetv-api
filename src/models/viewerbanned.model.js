import mongoose from "mongoose";
import { Schema } from "mongoose";

/*
Viewer_Banned: 
streamerId,
viewers: [
{..., createdAt },{...}
],
*/

const Banned = mongoose.model(
  "Banned",
  new Schema({
    streamer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bans: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  })
);

export default Banned;
