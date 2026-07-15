import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const ACCESS_TOKEN_KEY = 'nexora_access_token';
const REFRESH_TOKEN_KEY = 'nexora_refresh_token';
const ID_TOKEN_KEY = 'nexora_id_token';

async function setItem(key: string, value: string) {
  if (isWeb) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function removeItem(key: string) {
  if (isWeb) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveTokens(accessToken: string, refreshToken: string, idToken?: string) {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  await setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (idToken) {
    await setItem(ID_TOKEN_KEY, idToken);
  }
}

export async function getAccessToken() {
  return await getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return await getItem(REFRESH_TOKEN_KEY);
}

export async function getIdToken() {
  return await getItem(ID_TOKEN_KEY);
}

export async function clearTokens() {
  await removeItem(ACCESS_TOKEN_KEY);
  await removeItem(REFRESH_TOKEN_KEY);
  await removeItem(ID_TOKEN_KEY);
}
