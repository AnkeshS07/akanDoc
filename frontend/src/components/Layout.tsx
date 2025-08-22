import React from 'react'
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Container, Switch, CssBaseline } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { MiscAPI } from '../lib/api'
import { ThemeProvider, createTheme } from '@mui/material/styles'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { token, logout } = useAuth()
	const [dark, setDark] = React.useState<boolean>(false)
	const navigate = useNavigate()

	const theme = React.useMemo(() => createTheme({ palette: { mode: dark ? 'dark' : 'light' } }), [dark])

	React.useEffect(() => {
		MiscAPI.getDarkMode().then((r) => {
			const dm = (r.data as any)?.darkMode
			if (typeof dm === 'boolean') setDark(dm)
		}).catch(() => {})
	}, [])

	const handleDarkToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked
		setDark(value)
		try { await MiscAPI.setDarkMode(value) } catch {}
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box>
				<AppBar position="static" color="primary">
					<Toolbar>
						<IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" sx={{ flexGrow: 1 }} component={RouterLink} to="/" color="inherit" style={{ textDecoration: 'none' }}>
							AkanDoc
						</Typography>
						<Typography sx={{ mr: 2 }}>Dark</Typography>
						<Switch checked={dark} onChange={handleDarkToggle} color="default" />
						{token ? (
							<>
								<Button color="inherit" component={RouterLink} to="/providers">Providers</Button>
								<Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
								<Button color="inherit" component={RouterLink} to="/contact">Contact</Button>
								<Button color="inherit" onClick={async () => { await logout(); navigate('/') }}>Logout</Button>
							</>
						) : (
							<>
								<Button color="inherit" component={RouterLink} to="/login">Login</Button>
								<Button color="inherit" component={RouterLink} to="/signup">Signup</Button>
							</>
						)}
					</Toolbar>
				</AppBar>
				<Container sx={{ py: 4 }}>
					{children}
				</Container>
			</Box>
		</ThemeProvider>
	)
}