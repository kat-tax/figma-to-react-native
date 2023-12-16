export const actions = [
  'apply',
  'view diff',
  'reset',
];

export async function patch(action: string) {
  switch (action) {
    case 'View Diff':
      console.log('[diff]', action);
      break;
    case 'Apply':
      confirm(`Are you sure you want to apply the component code changes?`);
      break;
    case 'reset':
      confirm(`Are you sure you want to clear the code changes?`);
      break;
    }
}
