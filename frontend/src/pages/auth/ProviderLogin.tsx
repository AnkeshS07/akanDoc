import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Container, Paper, Stack, TextField, Typography, Alert } from '@mui/material'
import { useAuth } from '../../providers/AuthProvider'

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function ProviderLogin() {
	const { loginProvider, loading, error } = useAuth()
	const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

	const onSubmit = async (values: FormValues) => {
		await loginProvider(values.email, values.password)
	}

	return (
		<Container maxWidth="sm" sx={{ py: 8 }}>
			<Paper sx={{ p: 4 }}>
				<Stack spacing={2}>
					<Typography variant="h5">Provider Login</Typography>
					{error && <Alert severity="error">{error}</Alert>}
					<TextField label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
					<TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
					<Button onClick={handleSubmit(onSubmit)} disabled={loading} variant="contained">Login</Button>
				</Stack>
			</Paper>
		</Container>
	)
}