export default async function profile(
  fn: () => Promise<void>,
  args: any[] = [],
) {
  const t0 = Date.now();
  await fn();
  const t1 = Date.now();
  console.log(`>> [${fn.name}]`, t1 - t0, 'ms', ...args);
}
