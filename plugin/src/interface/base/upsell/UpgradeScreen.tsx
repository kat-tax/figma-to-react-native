export function UpgradeScreen() {
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
    </div>
  )
}
