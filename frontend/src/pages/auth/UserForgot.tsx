import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Container, Paper, Stack, TextField, Typography, Alert } from '@mui/material'
import { UserAPI } from '../../lib/api'
import { useState } from 'react'

const emailSchema = z.object({ email: z.string().email() })
const otpSchema = z.object({ email: z.string().email(), otp: z.string().min(4).max(6) })
const resetSchema = z.object({ newPassword: z.string().min(6), confirmNewPassword: z.string().min(6) })
	.refine((d) => d.newPassword === d.confirmNewPassword, { message: 'Passwords do not match', path: ['confirmNewPassword'] })

type EmailValues = z.infer<typeof emailSchema>

type OtpValues = z.infer<typeof otpSchema>

type ResetValues = z.infer<typeof resetSchema>

export default function UserForgot() {
	const [stage, setStage] = useState<'email' | 'otp' | 'reset'>('email')
	const [email, setEmail] = useState<string>('')
	const [error, setError] = useState<string | null>(null)
	const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) })
	const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema), defaultValues: { email } })
	const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) })

	const onSend = async ({ email }: EmailValues) => {
		try {
			await UserAPI.sendForgotOtp({ email })
			setEmail(email)
			setStage('otp')
			setError(null)
		} catch (e: any) {
			setError(e?.response?.data?.message || 'Failed to send OTP')
		}
	}
	const onVerify = async ({ otp }: OtpValues) => {
		try {
			await UserAPI.verifyForgotOtp({ email, otp })
			setStage('reset')
			setError(null)
		} catch (e: any) {
			setError(e?.response?.data?.message || 'Invalid OTP')
		}
	}
	const onReset = async (values: ResetValues) => {
		try {
			await UserAPI.updateNewPassword(values)
			setStage('email')
			setError(null)
		} catch (e: any) {
			setError(e?.response?.data?.message || 'Failed to reset password')
		}
	}

	return (
		<Container maxWidth="sm" sx={{ py: 8 }}>
			<Paper sx={{ p: 4 }}>
				<Stack spacing={2}>
					<Typography variant="h5">Forgot Password</Typography>
					{error && <Alert severity="error">{error}</Alert>}
					{stage === 'email' && (
						<Stack spacing={2}>
							<TextField label="Email" type="email" {...emailForm.register('email')} error={!!emailForm.formState.errors.email} helperText={emailForm.formState.errors.email?.message} />
							<Button onClick={emailForm.handleSubmit(onSend)} variant="contained">Send OTP</Button>
						</Stack>
					)}
					{stage === 'otp' && (
						<Stack spacing={2}>
							<TextField label="OTP" {...otpForm.register('otp')} error={!!otpForm.formState.errors.otp} helperText={otpForm.formState.errors.otp?.message} />
							<Button onClick={otpForm.handleSubmit(onVerify)} variant="contained">Verify OTP</Button>
						</Stack>
					)}
					{stage === 'reset' && (
						<Stack spacing={2}>
							<TextField label="New Password" type="password" {...resetForm.register('newPassword')} error={!!resetForm.formState.errors.newPassword} helperText={resetForm.formState.errors.newPassword?.message} />
							<TextField label="Confirm New Password" type="password" {...resetForm.register('confirmNewPassword')} error={!!resetForm.formState.errors.confirmNewPassword} helperText={resetForm.formState.errors.confirmNewPassword?.message} />
							<Button onClick={resetForm.handleSubmit(onReset)} variant="contained">Update Password</Button>
						</Stack>
					)}
				</Stack>
			</Paper>
		</Container>
	)
}