import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../providers/AuthProvider'
import { ContactAPI } from '../lib/api'

const schema = z.object({ email: z.string().email(), subject: z.string().min(2), message: z.string().min(5) })

type FormValues = z.infer<typeof schema>

export default function Contact() {
	const { role, profile } = useAuth()
	const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: profile?.email ?? '' } })
	const onSubmit = async (values: FormValues) => {
		try {
			if (role === 'provider') await ContactAPI.providerContact(values)
			else await ContactAPI.userContact(values)
			reset({ email: profile?.email ?? '', subject: '', message: '' })
		} catch (e: any) {
			setError('subject', { message: e?.response?.data?.message || 'Failed to submit' })
		}
	}
	return (
		<Paper sx={{ p: 4 }}>
			<Stack spacing={2}>
				<Typography variant="h5">Contact Us</Typography>
				<TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
				<TextField label="Subject" {...register('subject')} error={!!errors.subject} helperText={errors.subject?.message} />
				<TextField label="Message" {...register('message')} error={!!errors.message} helperText={errors.message?.message} multiline rows={4} />
				<Button onClick={handleSubmit(onSubmit)} variant="contained">Send</Button>
			</Stack>
		</Paper>
	)
}