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
  new Schema({
    liveId: { type: Schema.Types.ObjectId, ref: "Live", required: true },
    gifts: [
      {
        _id: false,
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        items: [
          {
            _id: false,
            giftId: {
              type: Schema.Types.ObjectId,
              ref: "Gift",
              required: true,
            },
            coin: Number,
          },
        ],
      },
    ],
  })
);

export default GiveOfLive;
