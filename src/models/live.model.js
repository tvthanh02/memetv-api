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
      title: String,
      thumbnail: String,
      urlHlsStream: String,
      status: { type: String, enum: ["live", "end"] },
      tag: String,
    },
    { timestamps: true }
  )
);

export default Live;
