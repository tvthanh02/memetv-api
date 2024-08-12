import mongoose from "mongoose";
import { Schema } from "mongoose";

/*
liveId, 
gift: [
	{ user: {....},
	 item: [123, 456,...]
}
], 

 */

const GiveOfLive = mongoose.model(
  "GiftOfLive",
  new Schema(
    {
      liveId: { type: Schema.Types.ObjectId, ref: "Live", required: true },
      gifts: [
        {
          sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
          items: [{ type: Schema.Types.ObjectId, ref: "Gift", required: true }],
        },
      ],
    },
    { timestamps: true }
  )
);

export default GiveOfLive;
