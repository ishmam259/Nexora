import { ModuleStack } from '@/components/module-stack';
import { CHAT_COLOR } from '@/constants/modules';

export default function ConversationLayout() {
  return <ModuleStack accent={CHAT_COLOR} />;
}
