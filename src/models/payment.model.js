import mongoose from "mongoose";
import { Schema } from "mongoose";

const Payment = mongoose.model(
  "Payment",
  new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.String, required: true },
    requestId: { type: Schema.Types.String, required: true },
    transId: Number,
    amount: { type: Schema.Types.Number, required: true },
    rechargePackage: {
      type: Schema.Types.ObjectId,
      ref: "CoinPrice",
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: ["pending", "paid", "fail"],
      default: "pending",
    },
  })
);

export default Payment;
