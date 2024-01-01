interface ProgressBarProps {
  percent: string,
}

export function ProgressBar(props: ProgressBarProps) {
  return (
    <div className="center fill">
      <div
        style={{
          width: '150px',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'var(--figma-color-border-disabled)',
        }}>
        <div
          style={{
            width: props.percent,
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'var(--figma-color-bg-disabled-secondary)',
          }}
        />
      </div>
    </div>
  );
}
