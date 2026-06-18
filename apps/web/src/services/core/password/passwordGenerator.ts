const DEFAULT_PASSWORD_LENGTH = 16;
const PASSWORD_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export function generateUserPassword(length = DEFAULT_PASSWORD_LENGTH): string {
  const maxAcceptedByte =
    Math.floor(256 / PASSWORD_ALPHABET.length) * PASSWORD_ALPHABET.length;
  const bytes = new Uint8Array(Math.max(length * 2, 32));
  let password = '';

  while (password.length < length) {
    globalThis.crypto.getRandomValues(bytes);

    for (const byte of bytes) {
      if (byte >= maxAcceptedByte) {
        continue;
      }

      password += PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length];

      if (password.length === length) {
        break;
      }
    }
  }

  return password;
}
