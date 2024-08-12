import mongoose from "mongoose";
import { Schema } from "mongoose";

/*
Gift:
id
name:
thumb:
coin


*/

const Gift = mongoose.model(
  "Gift",
  new Schema({
    giftName: String,
    thumbnail: String,
    coin: { type: Number, min: 1 },
  })
);

export default Gift;
