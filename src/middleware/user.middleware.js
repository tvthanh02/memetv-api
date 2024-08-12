import { Regex } from "@/constants/index.js";

const userMiddleware = {
  // with email, password
  isValidFieldAuthen: (req, res, next) => {
    const { email, password } = req.body;

    if (email.length === 0 || password.length < 8) {
      res.status(400).json({
        error: 1,
        message: "Bad Request",
      });
      return;
    }

    if (!Regex.email.test(email)) {
      {
        res.status(400).json({
          error: 1,
          message: "Email Field Is Bad Request",
        });
        return;
      }
    }

    next();
  },
};

export default userMiddleware;
