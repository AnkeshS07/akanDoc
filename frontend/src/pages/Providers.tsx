import { useQuery } from '@tanstack/react-query'
import { ProviderAPI } from '../lib/api'
import { Alert, Avatar, Card, CardActions, CardContent, CardHeader, CircularProgress, Stack, TextField, Typography, Button, Box } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export default function Providers() {
	const { data, isLoading, error } = useQuery({ queryKey: ['providers'], queryFn: () => ProviderAPI.getAll() })
	const [q, setQ] = useState('')
	const providers = useMemo(() => data?.data?.allProviders ?? [], [data])
	const filtered = useMemo(() => providers.filter((p: any) => p.name?.toLowerCase().includes(q.toLowerCase()) || p.specialization?.toLowerCase().includes(q.toLowerCase())), [providers, q])

	if (isLoading) return <Stack alignItems="center" mt={8}><CircularProgress /></Stack>
	if (error) return <Alert severity="error">Failed to load providers</Alert>

	return (
		<Stack spacing={2}>
			<Typography variant="h5">Find Providers</Typography>
			<TextField placeholder="Search by name or specialization" value={q} onChange={(e) => setQ(e.target.value)} />
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
				{filtered.map((p: any) => (
					<Card key={p._id}>
						<CardHeader avatar={<Avatar src={p.userProfile ? p.userProfile : undefined}>{p.name?.[0]}</Avatar>} title={p.name} subheader={`${p.qualification ?? '-'} • ${p.specialization ?? '-'}`} />
						<CardContent>
							<Typography variant="body2">{p.bio ?? 'No bio provided'}</Typography>
						</CardContent>
						<CardActions>
							<Button component={RouterLink} to={`/book/${p._id}`} size="small" variant="contained">Book</Button>
						</CardActions>
					</Card>
				))}
			</Box>
		</Stack>
	)
}