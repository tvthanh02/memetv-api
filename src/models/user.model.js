import mongoose from "mongoose";
import { Schema } from "mongoose";
import { Regex } from "@/constants/index.js";
import { Generate } from "@/utils/index.js";

/*

User: 
id
avatar,   
displayName,
firstName
lastName
wasborn
sdt
email: 
coin
role: viewer | idol | stream_game | admin
password: 

*/

const User = mongoose.model(
  "User",
  new Schema({
    avatar: {
      type: String,
      default: "avatar-default.png",
    },
    displayName: {
      type: String,
      default: Generate.defaultDisplayName,
    },
    firstName: String,
    lastName: String,
    wasborn: Date,
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return Regex.phoneNumber.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    email: {
      type: String,
      validate: {
        validator: function (v) {
          return Regex.email.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    coin: Number,
    onlyStreamer: {
      status: { type: String, enum: ["ban", "warn", "normal"] },
    },
    role: { type: String, enum: ["viewer", "idol", "game", "admin"] },
    password: String,
    googleId: String,
    facebookId: String,
  })
);

export default User;
