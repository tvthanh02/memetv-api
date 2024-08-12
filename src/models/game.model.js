import mongoose from "mongoose";
import { Schema } from "mongoose";

/* name: String */

const Game = mongoose.model(
  "Game",
  new Schema({
    nameGame: String,
  })
);

export default Game;
