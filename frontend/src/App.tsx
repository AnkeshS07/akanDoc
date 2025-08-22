import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './providers/AuthProvider'

function RequireAuth({ children }: { children: JSX.Element }) {
	const { token } = useAuth()
	if (!token) return <Navigate to="/login" replace />
	return children
}

function Home() {
	return (
		<div style={{ padding: 24 }}>
			<h2>AkanDoc</h2>
			<nav style={{ display: 'flex', gap: 12 }}>
				<Link to="/login">Login</Link>
				<Link to="/signup">User Signup</Link>
				<Link to="/provider/login">Provider Login</Link>
				<Link to="/provider/signup">Provider Signup</Link>
			</nav>
		</div>
	)
}

function NotFound() {
	return <div style={{ padding: 24 }}>Not Found</div>
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				{/* User auth */}
				<Route path="/signup" element={<div />} />
				<Route path="/verify-otp" element={<div />} />
				<Route path="/login" element={<div />} />
				<Route path="/forgot" element={<div />} />
				<Route path="/change-password" element={<RequireAuth><div /></RequireAuth>} />

				{/* Provider auth */}
				<Route path="/provider/signup" element={<div />} />
				<Route path="/provider/verify-otp" element={<div />} />
				<Route path="/provider/login" element={<div />} />
				<Route path="/provider/forgot" element={<div />} />
				<Route path="/provider/change-password" element={<RequireAuth><div /></RequireAuth>} />

				{/* App features */}
				<Route path="/providers" element={<div />} />
				<Route path="/book/:providerId" element={<RequireAuth><div /></RequireAuth>} />
				<Route path="/profile" element={<RequireAuth><div /></RequireAuth>} />
				<Route path="/contact" element={<RequireAuth><div /></RequireAuth>} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	)
}
