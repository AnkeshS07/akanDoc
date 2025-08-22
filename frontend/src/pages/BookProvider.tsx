import { useParams, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Button, Paper, Stack, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material'
import { BookingAPI } from '../lib/api'

const schema = z.object({
	healthComplaint: z.string().min(3),
	specialist: z.boolean(),
	description: z.string().optional(),
	selectedDateTime: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export default function BookProvider() {
	const { providerId } = useParams()
	const navigate = useNavigate()
	const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { specialist: false } as any })

	const onSubmit: SubmitHandler<FormValues> = async (values) => {
		try {
			await BookingAPI.bookNow({ ...values, doctorId: providerId! })
			navigate('/providers')
		} catch (e: any) {
			setError('healthComplaint', { message: e?.response?.data?.message || 'Booking failed' })
		}
	}

	return (
		<Paper sx={{ p: 4 }}>
			<Stack spacing={2}>
				<Typography variant="h5">Book Appointment</Typography>
				<TextField label="Health Complaint" {...register('healthComplaint')} error={!!errors.healthComplaint} helperText={errors.healthComplaint?.message} />
				<FormControlLabel control={<Checkbox {...register('specialist')} />} label="Need Specialist" />
				<TextField label="Description" {...register('description')} />
				<TextField type="datetime-local" label="Select Date & Time" InputLabelProps={{ shrink: true }} {...register('selectedDateTime')} error={!!errors.selectedDateTime} helperText={errors.selectedDateTime?.message} />
				<Button onClick={handleSubmit(onSubmit)} variant="contained">Submit</Button>
			</Stack>
		</Paper>
	)
}