import mongoose from "mongoose";
const DB_HOST = process.env.DB_HOST;

const database = {
  connect: () => {
    mongoose
      .connect(DB_HOST)
      .then(() => console.log("database connect success..."))
      .catch((err) => console.log("database connect fail " + err));
  },
};

export default database;
