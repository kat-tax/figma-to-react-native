export async function bytesToDataURL(bytes: Uint8Array, type?: string): Promise<string> {
  const blob = new Blob([bytes], {type});
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
