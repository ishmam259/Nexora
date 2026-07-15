import { ModuleStack } from '@/components/module-stack';
import { MODULES } from '@/constants/modules';

export default function PrintLayout() {
  return <ModuleStack accent={MODULES.find((m) => m.key === 'print')!.color} />;
}
