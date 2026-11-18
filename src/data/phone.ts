export const PHONE_INPUT_PATTERN =
  String.raw`^\s*(?:0(?=(?:[\s\x28\x29\x2D]*[0-9]){9,10}[\s\x28\x29\x2D]*$)[0-9\s\x28\x29\x2D]*|(?:\+|00)[1-9](?=(?:[\s\x28\x29\x2D]*[0-9]){7,14}[\s\x28\x29\x2D]*$)[0-9\s\x28\x29\x2D]*)\s*$`;

const PHONE_CHARACTERS = /^[+0-9\s()-]+$/;
const PHONE_SEPARATORS = /[\s()-]/g;
const UK_PHONE = /^0[0-9]{9,10}$/;
const INTERNATIONAL_PHONE = /^(?:\+|00)[1-9][0-9]{7,14}$/;

export function isValidPhoneNumber(value: string): boolean {
  const phone = value.trim();
  if (!phone || !PHONE_CHARACTERS.test(phone)) return false;

  const normalized = phone.replace(PHONE_SEPARATORS, '');
  return UK_PHONE.test(normalized) || INTERNATIONAL_PHONE.test(normalized);
}
