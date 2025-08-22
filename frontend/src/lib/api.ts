import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const DEVICE_ID_STORAGE_KEY = 'device_id';
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';
export const AUTH_ROLE_STORAGE_KEY = 'auth_role'; // 'user' | 'provider'

function getOrCreateDeviceId(): string {
	let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
	if (!deviceId) {
		deviceId = crypto.randomUUID();
		localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
	}
	return deviceId;
}

export const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: false,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
	const deviceId = getOrCreateDeviceId();
	config.headers = config.headers || {};
	config.headers['device_id'] = deviceId;
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(resp) => resp,
	(error) => {
		if (error?.response?.status === 401) {
			// auto-logout on unauthorized
			localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
		}
		return Promise.reject(error);
	}
);

// Helper types
export type ApiResponse<T = unknown> = {
	status: number;
	message: string;
	data: T;
	token?: string;
};

// Endpoint helpers (user)
export const UserAPI = {
	signup(payload: { name: string; email: string; password: string; phone: string; countryCode: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/user/signup', payload).then(r => r.data);
	},
	verifyOtp(payload: { email: string; otp: number | string; device_token?: string; device_type?: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/user/verify-otp', payload).then(r => r.data);
	},
	login(payload: { email: string; password: string; device_token?: string; device_type?: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/user/login', payload).then(r => r.data);
	},
	sendForgotOtp(payload: { email: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/sendForgetPassOtp', payload).then(r => r.data);
	},
	verifyForgotOtp(payload: { email: string; otp: string | number; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/verifyPassOtp', payload).then(r => r.data);
	},
	updateNewPassword(payload: { newPassword: string; confirmNewPassword: string; }): Promise<ApiResponse<any>> {
		return api.put('/api/v1/auth/user/updateNewPassword', payload).then(r => r.data);
	},
	changePassword(payload: { password: string; confirmPassword: string; confirmNewPassword: string; }): Promise<ApiResponse<any>> {
		return api.put('/api/v1/auth/changePassword', payload).then(r => r.data);
	},
	getMe(): Promise<ApiResponse<any>> {
		return api.get('/api/v1/user/getUser').then(r => r.data);
	},
	updateProfile(formData: FormData): Promise<ApiResponse<any>> {
		return api.put('/api/v1/user/update-profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
	},
	getProfileImage(file: string) {
		return `${API_BASE_URL}/api/v1/user/get-update-profile?file=${encodeURIComponent(file)}`;
	},
	logout(): Promise<ApiResponse<any>> {
		return api.post('/api/v1/user/logout', {}).then(r => r.data);
	},
	resendOtp(payload: { email: string; }): Promise<any> {
		return api.post('/api/v1/auth/user/resendMailOtp', payload).then(r => r.data);
	}
};

// Endpoint helpers (provider)
export const ProviderAPI = {
	signup(payload: { name: string; email: string; password: string; phone: string; countryCode: string; licensed: boolean; location: { type: 'Point'; coordinates: [number, number] } }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/provider/signup', payload).then(r => r.data);
	},
	verifyOtp(payload: { email: string; otp: number | string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/provider/verify-otp', payload).then(r => r.data);
	},
	login(payload: { email: string; password: string; device_token?: string; device_type?: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/provider/login', payload).then(r => r.data);
	},
	sendForgotOtp(payload: { email: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/provider/sendForgetPassOtp', payload).then(r => r.data);
	},
	verifyForgotOtp(payload: { email: string; otp: string | number; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/provider/verifyPassOtp', payload).then(r => r.data);
	},
	updateNewPassword(payload: { newPassword: string; confirmNewPassword: string; }): Promise<ApiResponse<any>> {
		return api.put('/api/v1/auth/provider/updateNewPassword', payload).then(r => r.data);
	},
	changePassword(payload: { password: string; confirmPassword: string; confirmNewPassword: string; }): Promise<ApiResponse<any>> {
		return api.put('/api/v1/auth/provider/changePassword', payload).then(r => r.data);
	},
	getMe(): Promise<ApiResponse<any>> {
		return api.get('/api/v1/provider/getProvider').then(r => r.data);
	},
	updateProfile(formData: FormData): Promise<ApiResponse<any>> {
		return api.put('/api/v1/provider/update-profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
	},
	getProfileImage(file: string) {
		return `${API_BASE_URL}/api/v1/provider/get-update-profile?file=${encodeURIComponent(file)}`;
	},
	getAll(): Promise<ApiResponse<{ allProviders: any[] }>> {
		return api.get('/api/v1/provider/getAllProviders').then(r => r.data);
	},
	logout(): Promise<ApiResponse<any>> {
		return api.post('/api/v1/provider/logout', {}).then(r => r.data);
	},
	resendOtp(payload: { email: string; }): Promise<any> {
		return api.post('/api/v1/auth/provider/resendMailOtp', payload).then(r => r.data);
	},
	getEnums(): Promise<{ status: number; data: { qualification: string[]; specialization: string[] }; message: string; }> {
		return api.get('/api/v1/provider/getAllEnum').then(r => r.data);
	}
};

// Booking
export const BookingAPI = {
	bookNow(payload: { healthComplaint: string; specialist: boolean; description?: string; selectedDateTime: string; doctorId: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/auth/bookingRequest', payload).then(r => r.data);
	}
};

// Contact us
export const ContactAPI = {
	userContact(payload: { email: string; subject: string; message: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/user/contactUs', payload).then(r => r.data);
	},
	providerContact(payload: { email: string; subject: string; message: string; }): Promise<ApiResponse<any>> {
		return api.post('/api/v1/provider/contactUs', payload).then(r => r.data);
	}
};

// Dark mode
export const MiscAPI = {
	setDarkMode(value: boolean): Promise<ApiResponse<any>> {
		return api.post('/api/v1/darkMode', { darkMode: value }).then(r => r.data);
	},
	getDarkMode(): Promise<ApiResponse<{ darkMode: boolean }>> {
		return api.get('/api/v1/getDarkMode').then(r => r.data);
	}
};