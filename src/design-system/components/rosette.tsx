import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

export interface RosetteProps {
  size: number;
  color: string;
  opacity?: number;
  /** Number of interlaced rings. */
  layers?: number;
  /** Waves per ring. */
  waves?: number;
  strokeWidth?: number;
}

/**
 * Guilloche-style line pattern, the "security print" texture on the
 * membership card and other brand surfaces. Purely decorative.
 */
export function Rosette({
  size,
  color,
  opacity = 0.1,
  layers = 4,
  waves = 14,
  strokeWidth = 0.8,
}: RosetteProps) {
  const paths = useMemo(() => rosettePaths(size, layers, waves), [size, layers, waves]);

  return (
    <Svg width={size} height={size} opacity={opacity} pointerEvents="none" accessible={false}>
      {paths.map((d, index) => (
        <Path key={index} d={d} stroke={color} strokeWidth={strokeWidth} fill="none" />
      ))}
    </Svg>
  );
}

export function rosettePaths(size: number, layers: number, waves: number): string[] {
  const center = size / 2;
  const points = 220;
  const paths: string[] = [];

  for (let layer = 0; layer < layers; layer++) {
    for (const flip of [0, Math.PI]) {
      const base = size * (0.3 + layer * 0.04);
      const amplitude = size * 0.055;
      const phase = flip + (Math.PI / waves) * (layer / layers);
      let d = '';
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const r = base + amplitude * Math.cos(waves * theta + phase);
        d += `${i ? 'L' : 'M'}${(center + r * Math.cos(theta)).toFixed(1)} ${(center + r * Math.sin(theta)).toFixed(1)}`;
      }
      paths.push(`${d}Z`);
    }
  }
  return paths;
}
