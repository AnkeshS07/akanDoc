import React from 'react';
import { getAuthRole, getAuthToken, setAuth, clearAuth } from '../lib/auth';
import type { AuthRole } from '../lib/auth';
import { ProviderAPI, UserAPI } from '../lib/api';

export type AuthState = {
	token: string | null;
	role: AuthRole | null;
	profile: any | null;
	loading: boolean;
	error: string | null;
};

export type AuthContextValue = AuthState & {
	loginUser: (email: string, password: string) => Promise<void>;
	loginProvider: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshMe: () => Promise<void>;
	setUserFromVerify: (token: string, profile: any, role: AuthRole) => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = React.useState<AuthState>({ token: getAuthToken(), role: getAuthRole(), profile: null, loading: false, error: null });

	const refreshMe = React.useCallback(async () => {
		if (!state.token || !state.role) return;
		try {
			const resp = state.role === 'user' ? await UserAPI.getMe() : await ProviderAPI.getMe();
			setState((s) => ({ ...s, profile: resp.data, error: null }));
		} catch (e: any) {
			setState((s) => ({ ...s, error: e?.response?.data?.message || 'Failed to load profile' }));
		}
	}, [state.token, state.role]);

	React.useEffect(() => {
		if (state.token && state.role) {
			refreshMe();
		}
	}, []);

	const loginUser = async (email: string, password: string) => {
		setState((s) => ({ ...s, loading: true, error: null }));
		try {
			const resp = await UserAPI.login({ email, password });
			if (resp.token) setAuth(resp.token, 'user');
			setState({ token: resp.token || null, role: 'user', profile: resp.data, loading: false, error: null });
		} catch (e: any) {
			setState((s) => ({ ...s, loading: false, error: e?.response?.data?.message || 'Login failed' }));
		}
	};

	const loginProvider = async (email: string, password: string) => {
		setState((s) => ({ ...s, loading: true, error: null }));
		try {
			const resp = await ProviderAPI.login({ email, password });
			if (resp.token) setAuth(resp.token, 'provider');
			setState({ token: resp.token || null, role: 'provider', profile: resp.data, loading: false, error: null });
		} catch (e: any) {
			setState((s) => ({ ...s, loading: false, error: e?.response?.data?.message || 'Login failed' }));
		}
	};

	const logout = async () => {
		try {
			if (state.role === 'user') await UserAPI.logout();
			if (state.role === 'provider') await ProviderAPI.logout();
		} catch {}
		clearAuth();
		setState({ token: null, role: null, profile: null, loading: false, error: null });
	};

	const setUserFromVerify = (token: string, profile: any, role: AuthRole) => {
		setAuth(token, role);
		setState({ token, role, profile, loading: false, error: null });
	};

	const value: AuthContextValue = {
		...state,
		loginUser,
		loginProvider,
		logout,
		refreshMe,
		setUserFromVerify,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
	const ctx = React.useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}