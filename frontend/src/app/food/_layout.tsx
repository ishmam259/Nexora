import { ModuleStack } from '@/components/module-stack';
import { MODULES } from '@/constants/modules';

export default function FoodLayout() {
  return <ModuleStack accent={MODULES.find((m) => m.key === 'food')!.color} />;
}
