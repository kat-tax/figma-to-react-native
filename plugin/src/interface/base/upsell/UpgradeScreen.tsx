import {useUpsellEvent} from './useUpsellEvent';

export function UpgradeScreen() {
  const {hideUpsell} = useUpsellEvent();
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1rem',
      }}>
      <h2 style={{margin: 0, textAlign: 'center'}}>Upgrade to Premium</h2>
      <p style={{margin: 0, textAlign: 'center', color: 'var(--figma-color-text-secondary)'}}>
        Enter your project token to unlock premium features
      </p>
      <button
        onClick={hideUpsell}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--figma-color-text-secondary)',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}>
        Cancel
      </button>
    </div>
  )
}
