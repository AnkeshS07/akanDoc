import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import { ProviderAPI, UserAPI } from '../../lib/api'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'

const schema = z.object({
	otp: z.string().min(4).max(6),
})

type FormValues = z.infer<typeof schema>

type LocationState = { email: string; role: 'user' | 'provider' }

export default function VerifyOtp() {
	const navigate = useNavigate()
	const location = useLocation()
	const { setUserFromVerify } = useAuth()
	const state = (location.state || {}) as Partial<LocationState>
	const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({ resolver: zodResolver(schema) })

	const onSubmit = async (values: FormValues) => {
		try {
			if (state.role === 'provider') {
				const resp = await ProviderAPI.verifyOtp({ email: state.email!, otp: values.otp })
				if (resp.token) setUserFromVerify(resp.token, resp.data, 'provider')
				navigate('/profile')
			} else {
				const resp = await UserAPI.verifyOtp({ email: state.email!, otp: values.otp })
				if (resp.token) setUserFromVerify(resp.token, resp.data, 'user')
				navigate('/profile')
			}
		} catch (e: any) {
			setError('otp', { message: e?.response?.data?.message || 'Invalid OTP' })
		}
	}

	return (
		<Container maxWidth="sm" sx={{ py: 8 }}>
			<Paper sx={{ p: 4 }}>
				<Stack spacing={2}>
					<Typography variant="h5">Verify OTP</Typography>
					<TextField label="OTP" {...register('otp')} error={!!errors.otp} helperText={errors.otp?.message} />
					<Button onClick={handleSubmit(onSubmit)} variant="contained">Verify</Button>
				</Stack>
			</Paper>
		</Container>
	)
}