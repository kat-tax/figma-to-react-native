import {Flex, ValueField, Slider} from 'figma-kit';

export interface ValueFieldSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  style?: React.CSSProperties;
  precision?: number;
}

export function ValueFieldSlider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  suffix,
  style,
}: ValueFieldSliderProps) {
  return (
    <Flex
      style={{width: '100%', ...style}}
      align="center"
      gap="2">
      <ValueField.Numeric
        value={value}
        onChange={onChange}
        suffix={suffix}
        min={min}
        max={max}
        bigNudge={step * 10}
        smallNudge={step}
        style={{flex: 1}}
        precision={calculatePrecisionFromStep(step)}
      />
      <div style={{flex: 1}}>
        <Slider
          value={[value]}
          onValueChange={v => onChange(v[0])}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </Flex>
  );
}

function calculatePrecisionFromStep(step: number): number {
  if (step >= 1) return 0;
  const _str = step.toString();
  const _dec = _str.includes('.') ? _str.split('.')[1] : '';
  // Find the number of significant decimal places
  let precision = _dec.length;
  // Handle cases like 0.100 where trailing zeros might be significant
  while (precision > 0 && _dec[precision - 1] === '0') {
    precision--;
  }
  // Add one more digit of precision to ensure smooth operation
  return Math.min(precision + 1, 10); // Cap at 10 decimal places
}
