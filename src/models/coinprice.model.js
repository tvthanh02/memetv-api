import mongoose from "mongoose";
import { Schema } from "mongoose";

// 50000vnd = 500coin
// 80000vnd = 800coin
//10000vnd=1200coin

const CoinPrice = mongoose.model(
  "CoinPrice",
  new Schema({
    coin: { type: Schema.Types.Number, min: 500, required: true },
    price: { type: Schema.Types.Number, required: true },
    unit: { type: Schema.Types.String, enum: ["vnd"], default: "vnd" },
  })
);

export default CoinPrice;
