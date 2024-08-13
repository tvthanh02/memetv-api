import "dotenv/config";
import crypto from "crypto";
import axios from "../../node_modules/axios/index.js";
import { CoinPrice, Payment } from "@/models/index.js";
import { UserRespository } from "@/respositories/index.js";

const accessKey = process.env.MOMO_ACCESSKEY;
const secretKey = process.env.MOMO_SECRETKEY;
const orderInfo = "MEME TV";
const partnerCode = "MOMO";
const redirectUrl = process.env.MOMO_REDIRECTURL;
const ipnUrl = process.env.MOMO_IPNURL;
const requestType = "payWithMethod";
const orderExpireTime = 3;

const orderId = partnerCode + new Date().getTime();
const requestId = orderId;
const extraData = "";
// const paymentCode =
//   "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
const orderGroupId = "";
const autoCapture = true;
const lang = "vi";

const momoServices = {
  createTransaction: async (userId, rechargePackageId) => {
    const rechargePackage = await CoinPrice.findById(rechargePackageId).exec();

    if (!rechargePackage) {
      throw new Error("Invalid rechargePackageId!");
    }

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    const rawSignature = `accessKey=${accessKey}&amount=${rechargePackage.price}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    //signature

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    // create payment document
    try {
      await Payment.create({
        userId: userId,
        orderId: orderId,
        requestId: requestId,
        amount: rechargePackage.price,
        rechargePackage: rechargePackageId,
      });
    } catch (error) {
      throw new Error(
        "Error from momoServices.createTransaction() detail" + error
      );
    }

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: "MOMO",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: rechargePackage.price,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
      orderExpireTime: orderExpireTime,
    });

    const options = {
      method: "post",
      url: "https://test-payment.momo.vn/v2/gateway/api/create",

      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    const response = await axios(options);
    return response.data;
  },
  ipnConfirmTransaction: async (orderId, transId, statusPayment) => {
    try {
      const payment = await Payment.findOne({ orderId: orderId }).exec();

      if (statusPayment === "paid") {
        const [user, rechargePackage] = await Promise.all([
          UserRespository.getOneById(payment.userId),
          CoinPrice.findById(payment.rechargePackage).exec(),
        ]);
        user.coin = rechargePackage.coin;
        await user.save();
      }

      payment.transId = transId;
      payment.status = statusPayment;

      await payment.save();
    } catch (error) {
      throw new Error(
        "Error from momoServices.ipnSuccessTransaction() detail" + error
      );
    }
  },
};

export default momoServices;
