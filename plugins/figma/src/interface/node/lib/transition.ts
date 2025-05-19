import type {NodeMotionTransitionData} from 'types/node';

export const easingPresets = {
  linear: {
    name: 'Linear',
    bezier: [0, 0, 1, 1],
  },
  easeIn: {
    name: 'Ease In',
    bezier: [0.5, 0, 0.88, 0.77],
  },
  easeOut: {
    name: 'Ease Out',
    bezier: [0.12, 0.23, 0.5, 1],
  },
  easeInOut: {
    name: 'Ease In Out',
    bezier: [0.44, 0, 0.56, 1],
  },
  circIn: {
    name: 'Circle In',
    bezier: [0.55, 0, 1, 0.45],
  },
  circOut: {
    name: 'Circle Out',
    bezier: [0, 0.55, 0.45, 1],
  },
  circInOut: {
    name: 'Circle In Out',
    bezier: [0.85, 0, 0.15, 1],
  },
  backIn: {
    name: 'Back In',
    bezier: [0.79, -0.33, 0.79, 0.33],
  },
  backOut: {
    name: 'Back Out',
    bezier: [0.15, 0.45, 0.15, 1.35],
  },
  backInOut: {
    name: 'Back In Out',
    bezier: [0.7, -0.35, 0.3, 1.35],
  },
} as const;

export function getTransitionName(
  trans: NodeMotionTransitionData,
) {
  if (trans?.type === 'spring')
    return 'Spring';
  if (trans?.type === 'tween')
    return getEasingPreset(trans?.bezier)?.name ?? 'Ease';
  return 'Linear';
}

export function getEasingPreset(
  bezier: [number, number, number, number]
): {
  id: string,
  name: string,
  bezier: [number, number, number, number],
} | undefined {
  if (!bezier) return undefined;
  const [_x1, _y1, _x2, _y2] = bezier;
  const preset = Object.entries(easingPresets).find(([_, {bezier: [x1, y1, x2, y2] }]) =>
    x1 === _x1 &&
    y1 === _y1 &&
    x2 === _x2 &&
    y2 === _y2
  );
  if (!preset) return undefined;
  const [id, info] = preset;
  return {
    id,
    name: info.name,
    bezier: [...info.bezier],
  };
}

export function getTransitionCurve(transition: NodeMotionTransitionData) {
  if (!transition) return '';
  if (transition.type === 'spring') {
    return getSpringCurve(transition.spring);
  } else {
    return getEaseCurve(transition.bezier);
  }
}

export function getSpringCurve(spring: NodeMotionTransitionData['spring']) {
  const width = 300;
  const height = 157;
  const padding = 10;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  const midline = padding + graphHeight / 2;
  
  // Get spring parameters
  const isPhysics = spring?.type === 'physics';
  
  // Physics-based parameters
  const stiffness = spring?.stiffness ?? 400;
  const damping = spring?.damping ?? 30;
  const mass = spring?.mass ?? 1;
  
  // Time-based parameters
  const bounce = spring?.bounce ?? 0.2;
  
  // Calculate spring motion
  const points: string[] = [];
  const steps = 200;
  
  if (isPhysics) {
    // Calculate damping ratio for the system
    const massWeight = mass * 3.8;
    const dampingWeight = damping * 1.8;
    const dampingRatio = dampingWeight / (2 * Math.sqrt(stiffness * massWeight));

    // Calculate angular frequency
    const omega = Math.sqrt(stiffness / massWeight);
    
    // Initial position (displacement from equilibrium)
    const initialPos = 1.0;
    
    for (let i = 0; i <= steps; i++) {
      // 3 seconds total simulation
      const t = (i / steps) * 3;
      let x: number;
      
      if (dampingRatio < 1) {
        // Underdamped case (oscillations)
        const dampedFreq = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
        x = initialPos * Math.exp(-dampingRatio * omega * t) * 
            (Math.cos(dampedFreq * t) + (dampingRatio * omega / dampedFreq) * Math.sin(dampedFreq * t));
      } else if (dampingRatio === 1) {
        // Critically damped case
        x = initialPos * (1 + omega * t) * Math.exp(-omega * t);
      } else {
        // Overdamped case
        const alpha = omega * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
        const beta = omega * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1));
        x = initialPos * ((alpha * Math.exp(-beta * t) - beta * Math.exp(-alpha * t)) / (alpha - beta));
      }
      const px = padding + (i / steps) * graphWidth;
      const py = midline + x * (graphHeight * 0.4);
      points.push(`${px},${py}`);
    }

  // Time-based spring calculation
  } else {
    // 3 seconds total simulation
    const duration = 3;

    // Calculate frequency based on bounce (higher bounce = more oscillations)
    // Using a higher power to make effect minimal at low values
    const frequency = 2 + Math.pow(bounce, 5) * 6;

    // Calculate decay based on bounce
    // Higher bounce = less damping
    // Using a higher power to make effect minimal at low values
    const decay = 3 * (1 - Math.pow(bounce, 5) * 0.5);
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * duration;
      let x = 0;
      
      // Use a continuous formula that naturally produces a smooth curve at low bounce
      // and oscillations at higher bounce values
      x = Math.exp(-decay * t) * Math.cos(frequency * t * Math.PI * Math.min(1, bounce * 3));
      
      const px = padding + (i / steps) * graphWidth;
      // Position relative to midline, with appropriate scaling
      const py = midline + x * (graphHeight * 0.4);
      points.push(`${px},${py}`);
    }
  }
  
  // Create SVG path
  return `M${points.join(' L')}`;
}

export function getEaseCurve(bezier: NodeMotionTransitionData['bezier']) {
  if (!bezier) return '';

  const width = 300;
  const height = 157;
  const padding = 10;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  // Extract bezier control points
  const [x1, y1, x2, y2] = bezier;
  
  // Create SVG path for cubic bezier curve
  // Start at bottom left
  const startX = padding;
  const startY = padding + graphHeight;
  
  // End at top right
  const endX = width - padding;
  const endY = padding;
  
  // Convert normalized bezier points to SVG coordinates
  const cp1X = startX + x1 * graphWidth;
  const cp1Y = startY - y1 * graphHeight;
  const cp2X = startX + x2 * graphWidth;
  const cp2Y = startY - y2 * graphHeight;
  
  // Create SVG path with cubic bezier curve
  return `M${startX},${startY} C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
}
