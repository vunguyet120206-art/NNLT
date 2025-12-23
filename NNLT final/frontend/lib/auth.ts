import Cookies from 'js-cookie';
import { AuthResponse } from './api';

export const saveAuthTokens = (authResponse: AuthResponse) => {
  Cookies.set('access_token', authResponse.tokens.access, { expires: 1 });
  Cookies.set('refresh_token', authResponse.tokens.refresh, { expires: 7 });
};

export const clearAuthTokens = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get('access_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

