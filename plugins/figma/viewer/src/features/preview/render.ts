export async function render(html: string) {
  const output = document.createElement('div');
  output.innerHTML = html;
  return output;
}
