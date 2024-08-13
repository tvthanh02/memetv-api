import { Regex } from "@/constants/index.js";
import { UserRespository } from "@/respositories/index.js";
import { Gift } from "@/models/index.js";

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

  isValidCoinWhenGiveGift: async (req, res, next) => {
    const { uid } = req.headers.payload;
    const { itemId } = req.body;

    const [sender, gift] = await Promise.all([
      UserRespository.getOneById(uid),
      Gift.findById(itemId).exec(),
    ]);

    if (sender.coin < gift.coin) {
      res.status(402).json({
        error: 1,
        message: "Coin invalid",
      });
      return;
    }
    sender.coin -= gift.coin;
    await sender.save();

    next();
  },
};

export default userMiddleware;
