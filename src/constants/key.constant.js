import fs from "fs";

const keys = {
  privateKey: fs.readFileSync("src/key/rsa.private.pem"),
  publicKey: fs.readFileSync("src/key/rsa.public.pem"),
};

export default keys;
