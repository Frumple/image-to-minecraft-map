export function convertToInteger(str: string) {
  const integer = parseInt(str, 10);
  return isNaN(integer) ? null : integer;
}