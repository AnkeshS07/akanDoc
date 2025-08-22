import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Container, Paper, Stack, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material'
import { ProviderAPI } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
	confirmPassword: z.string().min(6),
	countryCode: z.string().min(1),
	phone: z.string().min(6),
	licensed: z.boolean().default(false),
	latitude: z.preprocess((v) => Number(v), z.number()),
	longitude: z.preprocess((v) => Number(v), z.number()),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

type ProviderSignupPayload = {
	name: string;
	email: string;
	password: string;
	phone: string;
	countryCode: string;
	licensed: boolean;
	location: { type: 'Point'; coordinates: [number, number] };
}

export default function ProviderSignup() {
	const navigate = useNavigate()
	const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { licensed: false } })

	const onSubmit = async (values: FormValues): Promise<void> => {
		const payload: ProviderSignupPayload = {
			name: values.name,
			email: values.email,
			password: values.password,
			phone: values.phone,
			countryCode: values.countryCode,
			licensed: values.licensed,
			location: { type: 'Point', coordinates: [values.longitude, values.latitude] },
		}
		try {
			await ProviderAPI.signup(payload)
			navigate('/provider/verify-otp', { state: { email: values.email, role: 'provider' } })
		} catch (e: any) {
			setError('email', { message: e?.response?.data?.msg || 'Signup failed' })
		}
	}

	return (
		<Container maxWidth="sm" sx={{ py: 8 }}>
			<Paper sx={{ p: 4 }}>
				<Stack spacing={2}>
					<Typography variant="h5">Provider Signup</Typography>
					<TextField label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
					<TextField label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
					<TextField label="Country Code" {...register('countryCode')} error={!!errors.countryCode} helperText={errors.countryCode?.message} />
					<TextField label="Phone" {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message} />
					<TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
					<TextField label="Confirm Password" type="password" {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
					<FormControlLabel control={<Checkbox {...register('licensed')} />} label="Licensed" />
					<Stack direction="row" spacing={2}>
						<TextField label="Latitude" {...register('latitude')} error={!!errors.latitude} helperText={errors.latitude?.message} />
						<TextField label="Longitude" {...register('longitude')} error={!!errors.longitude} helperText={errors.longitude?.message} />
					</Stack>
					<Button onClick={handleSubmit(onSubmit)} variant="contained">Create account</Button>
				</Stack>
			</Paper>
		</Container>
	)
}