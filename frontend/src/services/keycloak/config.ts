import { Platform } from 'react-native';

// For development: Point to host machine IP or localhost depending on platform
const getDiscoveryUrl = () => {
  // Replace this with your computer's local IP (e.g., '192.168.1.100') when testing on a physical device.
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:8081/realms/nexora`;
};

export const KEYCLOAK_CONFIG = {
  clientId: 'nexora-client',
  realm: 'nexora',
  discoveryUrl: getDiscoveryUrl(),
  scheme: 'nexora',
};
