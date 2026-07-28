import { Redirect, type Href } from 'expo-router';

/** Legacy route — AI now lives in the bottom tab. */
export default function AiAssistantRedirect() {
  return <Redirect href={'/assistant' as Href} />;
}
