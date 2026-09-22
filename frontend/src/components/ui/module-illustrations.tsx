import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Hand-drawn module illustrations, ported 1:1 from the Nexora Campus OS
 * design (exact paths/fills) — these are literal illustration colors,
 * independent of the active theme or accent.
 */

type IllustrationProps = { size?: number };

const SHADOW = <Ellipse cx={32} cy={58} rx={19} ry={3} fill="#000000" opacity={0.12} />;

export function FoodIllustration({ size = 56 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {SHADOW}
      <Path
        d="M24 13c-2-3 2-5 0-8M32 12c-2-3 2-5 0-8M40 13c-2-3 2-5 0-8"
        stroke="#CDBBAA"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M12 32c0-9 9-15 20-15s20 6 20 15z" fill="#F2C766" />
      <Ellipse cx={22} cy={27} rx={1.6} ry={1} fill="#F9DD95" />
      <Ellipse cx={29} cy={22} rx={1.6} ry={1} fill="#F9DD95" />
      <Ellipse cx={44} cy={27} rx={1.6} ry={1} fill="#F9DD95" />
      <Ellipse cx={36} cy={24} rx={5} ry={4} fill="#FFFFFF" />
      <Circle cx={36} cy={24} r={2} fill="#F2A93B" />
      <Circle cx={24} cy={24} r={2.2} fill="#5E9E4A" />
      <Circle cx={28} cy={20} r={1.6} fill="#5E9E4A" />
      <Circle cx={43} cy={29} r={1.8} fill="#C8432B" />
      <Path d="M9 31h46c0 12-10 22-23 22S9 43 9 31z" fill="#B5532F" />
      <Path d="M41 33h13c-1 9-7 16-15 18 3-5 2-13 2-18z" fill="#9C4427" />
      <Path d="M8 29h48a2 2 0 0 1 0 4H8a2 2 0 0 1 0-4z" fill="#CB6A43" />
    </Svg>
  );
}

export function MarketplaceIllustration({ size = 56 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {SHADOW}
      <Path d="M24 22v-5a8 8 0 0 1 16 0v5" stroke="#7C3420" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M13 22h38l-3 32H16z" fill="#2F8A55" />
      <Path d="M41 22h10l-3 32h-9z" fill="#267147" />
      <Rect x={13} y={20} width={38} height={5} rx={1.5} fill="#3FA066" />
      <Path d="M22 33h14l6 6-6 6H22a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" fill="#FBEBC9" />
      <Circle cx={36} cy={39} r={1.7} fill="#2F8A55" />
      <Path d="M24 37h7M24 41h5" stroke="#B5532F" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function LaundryIllustration({ size = 56 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {SHADOW}
      <Rect x={12} y={8} width={40} height={48} rx={6} fill="#EFE7DC" />
      <Rect x={12} y={8} width={40} height={12} rx={6} fill="#DCCFBF" />
      <Rect x={12} y={15} width={40} height={5} fill="#DCCFBF" />
      <Circle cx={19} cy={14} r={2.2} fill="#B5532F" />
      <Circle cx={25} cy={14} r={1.6} fill="#8A7E72" />
      <Rect x={36} y={12} width={11} height={4} rx={1.5} fill="#2F8A55" />
      <Circle cx={32} cy={37} r={13} fill="#CFC3B4" />
      <Circle cx={32} cy={37} r={10} fill="#8CC0D0" />
      <Path d="M22 38c3-2 5 2 8 0s5-2 8 0 5 2 4 0v1a10 10 0 0 1-20 0z" fill="#5E9DB3" />
      <Circle cx={28} cy={33} r={1.7} fill="#FFFFFF" />
      <Circle cx={35} cy={31} r={1.1} fill="#FFFFFF" />
      <Path d="M25 32a8 8 0 0 1 5-5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7} />
    </Svg>
  );
}

export function PrintIllustration({ size = 56 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {SHADOW}
      <Rect x={20} y={6} width={24} height={18} rx={1.5} fill="#FFFFFF" stroke="#E2D8CC" />
      <Path d="M24 11h12M24 15h9" stroke="#C9BFB3" strokeWidth={1.8} strokeLinecap="round" />
      <Rect x={8} y={20} width={48} height={22} rx={6} fill="#6B625B" />
      <Rect x={8} y={20} width={48} height={7} rx={6} fill="#857A72" />
      <Circle cx={48} cy={28} r={2} fill="#7FD19A" />
      <Circle cx={42} cy={28} r={2} fill="#E38A62" />
      <Rect x={15} y={34} width={34} height={3} rx={1.5} fill="#3F3833" />
      <Path d="M18 36h28v20H18z" fill="#FFFFFF" stroke="#E2D8CC" />
      <Path d="M22 42h20M22 46h16M22 50h18" stroke="#C9BFB3" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function MedicalIllustration({ size = 56 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {SHADOW}
      <Path d="M24 16v-4a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" stroke="#8A7E72" strokeWidth={3} fill="none" />
      <Rect x={8} y={16} width={48} height={38} rx={7} fill="#FFFFFF" stroke="#E6DCD1" strokeWidth={1.5} />
      <Path d="M8.8 44h46.4v3a7 7 0 0 1-7 7H15.8a7 7 0 0 1-7-7z" fill="#EFE6DB" />
      <Path d="M28 22h8v7h7v8h-7v7h-8v-7h-7v-8h7z" fill="#C8342B" />
      <Path d="M28 22h8v3h-8z" fill="#DE5247" />
    </Svg>
  );
}

export function LostFoundIllustration({ size = 56 }: IllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {SHADOW}
      <G transform="rotate(-6 28 28)">
        <Rect x={6} y={14} width={42} height={28} rx={4} fill="#F3E3CF" />
        <Rect x={6} y={14} width={42} height={8} rx={4} fill="#B5532F" />
        <Rect x={6} y={19} width={42} height={3} fill="#B5532F" />
        <Circle cx={16} cy={31} r={4.5} fill="#D9A98A" />
        <Path d="M25 29h15M25 34h10" stroke="#C9A88C" strokeWidth={2} strokeLinecap="round" />
      </G>
      <Circle cx={42} cy={39} r={10} fill="#CFE6EA" opacity={0.9} />
      <Circle cx={42} cy={39} r={10} fill="none" stroke="#3F3833" strokeWidth={4} />
      <Path d="M36 35a7 7 0 0 1 5-3" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M49.5 46.5l7 7" stroke="#3F3833" strokeWidth={5} strokeLinecap="round" />
      <Path d="M53 50l3.5 3.5" stroke="#B5532F" strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}

export const MODULE_ILLUSTRATIONS: Record<string, (props: IllustrationProps) => React.JSX.Element> = {
  food: FoodIllustration,
  marketplace: MarketplaceIllustration,
  laundry: LaundryIllustration,
  print: PrintIllustration,
  medical: MedicalIllustration,
  'lost-found': LostFoundIllustration,
};
