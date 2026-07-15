import { ModuleStack } from '@/components/module-stack';
import { MODULES } from '@/constants/modules';

export default function LostFoundLayout() {
  return <ModuleStack accent={MODULES.find((m) => m.key === 'lost-found')!.color} />;
}
