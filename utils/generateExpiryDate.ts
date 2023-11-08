export function generateExpiryDate(amount: number, unit: string) {
  const expirationDate = new Date();

  switch (unit) {
    case "seconds":
      expirationDate.setSeconds(expirationDate.getSeconds() + amount);
      break;

    case "hours":
      expirationDate.setHours(expirationDate.getHours() + amount);
      break;

    case "days":
      expirationDate.setDate(expirationDate.getDate() + amount);
      break;

    default:
      break;
  }

  return expirationDate;
}
