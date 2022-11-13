export function convertToInteger(str: string) {
  const integer = parseInt(str, 10);
  return isNaN(integer) ? null : integer;
}

export function roundToDecimalPlaces(num: number, decimalPlaces: number) {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round((num + Number.EPSILON) * factorOfTen) / factorOfTen;
}