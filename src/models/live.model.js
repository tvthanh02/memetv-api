import mongoose from "mongoose";
import { Schema } from "mongoose";

/* 
Live:
id
userId
title
thumbnail
url_hls_stream: http://…./playlist/stream_key/index.m3u8
status: live | end
tag

*/

const Live = mongoose.model(
  "Live",
  new Schema(
    {
      streamerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      title: { type: String, required: true },
      thumbnail: { type: String, required: true },
      urlChatLive: { type: String, required: true },
      urlHlsStream: { type: String, required: true },
      status: { type: String, enum: ["live", "end"], required: true },
      tag: { type: String, required: true },
    },
    { timestamps: true }
  )
);

export default Live;
