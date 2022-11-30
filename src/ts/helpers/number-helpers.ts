export function convertStringToInteger(str: string) {
  const integer = parseInt(str, 10);
  return isNaN(integer) ? null : integer;
}

export function convertColorComponentToHex(num: number) {
  return num.toString(16).padStart(2, '0');
}

export function convertRGBColorToHex(r: number, g: number, b: number) {
  const rKey = convertColorComponentToHex(r);
  const gKey = convertColorComponentToHex(g);
  const bKey = convertColorComponentToHex(b);

  return `${rKey}${gKey}${bKey}`;
}

export function roundToDecimalPlaces(num: number, decimalPlaces: number) {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round((num + Number.EPSILON) * factorOfTen) / factorOfTen;
}
