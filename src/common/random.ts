export function generateLinkToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const tokenParts: string[] = [];
  const bufferSize = characters.length;
  for (let i = 0; i < 3; i++) {
    let tokenPart = '';
    const randomBytes = new Uint8Array(bufferSize);
    crypto.getRandomValues(randomBytes);
    for (let j = 0; j < 3; j++) {
      const randomIndex = randomBytes[j] % bufferSize;
      tokenPart += characters.charAt(randomIndex);
    }
    tokenParts.push(tokenPart);
  }
  const token = tokenParts.join('-');
  return token;
}
