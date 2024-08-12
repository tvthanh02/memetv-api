import bcrypt from "bcryptjs";

const bcryptApi = {
  hash: (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },
  compare: (password, hashPassword) => {
    return bcrypt.compareSync(password, hashPassword);
  },
};

export default bcryptApi;
