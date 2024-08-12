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
};

export default generateApi;
