import { ModuleStack } from '@/components/module-stack';
import { MODULES } from '@/constants/modules';

export default function LaundryLayout() {
  return <ModuleStack accent={MODULES.find((m) => m.key === 'laundry')!.color} />;
}
