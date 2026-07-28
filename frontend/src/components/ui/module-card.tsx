import { SymbolViewProps } from 'expo-symbols';

import { SpringboardIcon } from '@/components/ui/springboard-icon';

/** @deprecated Prefer SpringboardIcon — kept for any remaining imports. */
export function ModuleCard(props: {
  label: string;
  icon: SymbolViewProps['name'];
  color: string;
  onPress: () => void;
}) {
  return <SpringboardIcon {...props} />;
}
