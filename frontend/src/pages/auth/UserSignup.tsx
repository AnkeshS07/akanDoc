import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import { UserAPI } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
	confirmPassword: z.string().min(6),
	countryCode: z.string().min(1),
	phone: z.string().min(6),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

export default function UserSignup() {
	const navigate = useNavigate()
	const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({ resolver: zodResolver(schema) })

	const onSubmit = async (values: FormValues) => {
		try {
			await UserAPI.signup(values)
			navigate('/verify-otp', { state: { email: values.email, role: 'user' } })
		} catch (e: any) {
			setError('email', { message: e?.response?.data?.msg || 'Signup failed' })
		}
	}

	return (
		<Container maxWidth="sm" sx={{ py: 8 }}>
			<Paper sx={{ p: 4 }}>
				<Stack spacing={2}>
					<Typography variant="h5">User Signup</Typography>
					<TextField label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
					<TextField label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
					<TextField label="Country Code" {...register('countryCode')} error={!!errors.countryCode} helperText={errors.countryCode?.message} />
					<TextField label="Phone" {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message} />
					<TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
					<TextField label="Confirm Password" type="password" {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
					<Button onClick={handleSubmit(onSubmit)} variant="contained">Create account</Button>
				</Stack>
			</Paper>
		</Container>
	)
}