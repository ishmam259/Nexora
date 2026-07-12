import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { KEYCLOAK_CONFIG } from './config';
import { saveTokens, getRefreshToken, clearTokens, getAccessToken } from './token';

WebBrowser.maybeCompleteAuthSession();

// Define discovery endpoints
const discovery = {
  authorizationEndpoint: `${KEYCLOAK_CONFIG.discoveryUrl}/protocol/openid-connect/auth`,
  tokenEndpoint: `${KEYCLOAK_CONFIG.discoveryUrl}/protocol/openid-connect/token`,
  revocationEndpoint: `${KEYCLOAK_CONFIG.discoveryUrl}/protocol/openid-connect/revoke`,
  userInfoEndpoint: `${KEYCLOAK_CONFIG.discoveryUrl}/protocol/openid-connect/userinfo`,
  endSessionEndpoint: `${KEYCLOAK_CONFIG.discoveryUrl}/protocol/openid-connect/logout`,
};

/**
 * Hook to initialize the Keycloak Auth Session in React Components
 */
export function useKeycloakAuth() {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: KEYCLOAK_CONFIG.scheme,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KEYCLOAK_CONFIG.clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  const handleLoginResponse = async (res: AuthSession.AuthSessionResult) => {
    if (res?.type === 'success' && res.params.code) {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: KEYCLOAK_CONFIG.clientId,
          code: res.params.code,
          redirectUri,
          extraParams: request?.codeVerifier
            ? { code_verifier: request.codeVerifier }
            : {},
        },
        discovery
      );
      
      await saveTokens(
        tokenResult.accessToken,
        tokenResult.refreshToken || '',
        tokenResult.idToken
      );

      return tokenResult;
    }
    return null;
  };

  return {
    request,
    response,
    promptAsync,
    handleLoginResponse,
    redirectUri,
  };
}

/**
 * Refresh the access token using the stored refresh token
 */
export async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const tokenResult = await AuthSession.refreshAsync(
    {
      clientId: KEYCLOAK_CONFIG.clientId,
      refreshToken,
    },
    discovery
  );

  await saveTokens(
    tokenResult.accessToken,
    tokenResult.refreshToken || refreshToken,
    tokenResult.idToken
  );

  return tokenResult.accessToken;
}

/**
 * Logout the user, clearing local tokens and notifying Keycloak
 */
export async function logoutUser() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  
  if (accessToken) {
    try {
      const details = {
        client_id: KEYCLOAK_CONFIG.clientId,
        token: refreshToken || accessToken,
      };
      
      const formBody = Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent((details as any)[key]))
        .join('&');

      await fetch(discovery.revocationEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: formBody,
      });
    } catch (e) {
      console.warn('Failed to revoke token on Keycloak:', e);
    }
  }

  await clearTokens();
}

const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64(input: string): string {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  
  let binary = '';
  const len = str.length;
  for (let i = 0; i < len; i += 4) {
    const char1 = b64chars.indexOf(str[i]);
    const char2 = b64chars.indexOf(str[i + 1]);
    const char3 = str[i + 2] === '=' ? 0 : b64chars.indexOf(str[i + 2]);
    const char4 = str[i + 3] === '=' ? 0 : b64chars.indexOf(str[i + 3]);
    
    const byte1 = (char1 << 2) | (char2 >> 4);
    const byte2 = ((char2 & 15) << 4) | (char3 >> 2);
    const byte3 = ((char3 & 3) << 6) | char4;
    
    binary += String.fromCharCode(byte1);
    if (str[i + 2] !== '=') binary += String.fromCharCode(byte2);
    if (str[i + 3] !== '=') binary += String.fromCharCode(byte3);
  }
  return binary;
}

/**
 * Decode JWT token to get claims/roles
 */
export function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const decoded = decodeBase64(base64Url);
    
    // Convert binary string to UTF-8
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT token:', e);
    return null;
  }
}
