import Svg, { Path } from 'react-native-svg';

/**
 * Social network marks for the card footer. Lucide dropped brand icons, so
 * these are drawn here in the same 24px stroke style.
 */
interface SocialIconProps {
  size?: number;
  color: string;
}

export function FacebookIcon({ size = 18, color }: SocialIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Svg>
  );
}

export function XIcon({ size = 18, color }: SocialIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M4 4l11.7 16H20L8.3 4z" />
      <Path d="M20 4l-6.4 7.3" />
      <Path d="M4 20l6.4-7.3" />
    </Svg>
  );
}

export function TikTokIcon({ size = 18, color }: SocialIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <Path d="M14 3a5 5 0 0 0 5 5" />
    </Svg>
  );
}
