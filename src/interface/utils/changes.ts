export const actions = [
  'diff',
  'patch',
  'reset',
];

export async function changes(action: string) {
  switch (action) {
    case 'diff':
      console.log('[diff]', action);
      break;
    case 'patch':
      confirm(`Are you sure you want to apply the component code changes?`);
      break;
    case 'reset':
      confirm(`Are you sure you want to clear the code changes?`);
      break;
    }
}
