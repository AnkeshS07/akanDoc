import { useAuth } from '../providers/AuthProvider'
import { Alert, Avatar, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { ProviderAPI, UserAPI } from '../lib/api'

export default function Profile() {
	const { role, profile, refreshMe } = useAuth()
	const [name, setName] = useState(profile?.name ?? '')
	const [phone, setPhone] = useState(profile?.phone ?? '')
	const [bio, setBio] = useState(profile?.bio ?? '')
	const [file, setFile] = useState<File | null>(null)
	const [msg, setMsg] = useState<string | null>(null)
	const [err, setErr] = useState<string | null>(null)

	useEffect(() => {
		setName(profile?.name ?? '')
		setPhone(profile?.phone ?? '')
		setBio((profile as any)?.bio ?? '')
	}, [profile])

	const onSave = async () => {
		try {
			const form = new FormData()
			if (name) form.append('name', name)
			if (phone) form.append('phone', phone)
			if (bio && role === 'provider') form.append('bio', bio)
			if (file) form.append('file', file)
			if (role === 'user') await UserAPI.updateProfile(form)
			else await ProviderAPI.updateProfile(form)
			await refreshMe()
			setMsg('Profile updated')
			setErr(null)
		} catch (e: any) {
			setErr(e?.response?.data?.message || 'Update failed')
		}
	}

	return (
		<Paper sx={{ p: 4 }}>
			<Stack spacing={2}>
				<Typography variant="h5">My Profile</Typography>
				{msg && <Alert severity="success">{msg}</Alert>}
				{err && <Alert severity="error">{err}</Alert>}
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar sx={{ width: 64, height: 64 }}>{profile?.name?.[0]}</Avatar>
					<Button component="label" variant="outlined">Upload Image
						<input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
					</Button>
				</Stack>
				<TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
				<TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
				{role === 'provider' && (
					<TextField label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} multiline rows={3} />
				)}
				<Button variant="contained" onClick={onSave}>Save</Button>
			</Stack>
		</Paper>
	)
}