import { ModuleStack } from '@/components/module-stack';
import { MODULES } from '@/constants/modules';

export default function MedicalLayout() {
  return <ModuleStack accent={MODULES.find((m) => m.key === 'medical')!.color} />;
}
