import { Platform } from 'react-native';

function getKeycloakBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:8081`;
}

export const KEYCLOAK_CONFIG = {
  clientId: 'nexora-client',
  realm: 'nexora',
  discoveryUrl: `${getKeycloakBaseUrl()}/realms/nexora`,
  scheme: 'nexora',
};
