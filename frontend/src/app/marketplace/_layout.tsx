import { ModuleStack } from '@/components/module-stack';
import { MODULES } from '@/constants/modules';

export default function MarketplaceLayout() {
  return <ModuleStack accent={MODULES.find((m) => m.key === 'marketplace')!.color} />;
}
