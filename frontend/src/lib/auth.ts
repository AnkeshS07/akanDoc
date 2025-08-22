import { AUTH_ROLE_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY } from './api';

export type AuthRole = 'user' | 'provider';

export function setAuth(token: string, role: AuthRole) {
	localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
	localStorage.setItem(AUTH_ROLE_STORAGE_KEY, role);
}

export function clearAuth() {
	localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
	localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
}

export function getAuthToken(): string | null {
	return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getAuthRole(): AuthRole | null {
	return (localStorage.getItem(AUTH_ROLE_STORAGE_KEY) as AuthRole) || null;
}