import crypto from "crypto";

function generateUniqueSixDigitNumber() {
  const digits = [];

  while (digits.length < 8) {
    const randomDigit = Math.floor(Math.random() * 10);
    if (!digits.includes(randomDigit)) {
      digits.push(randomDigit);
    }
  }
  return digits.join("");
}

const generateApi = {
  defaultDisplayName: `user${generateUniqueSixDigitNumber()}`,
  generateStreamkey: () => {
    return crypto.randomBytes(16).toString("hex");
  },
};

export default generateApi;
