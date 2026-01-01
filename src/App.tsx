import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeProvider'
import { Layout } from './components/Layout'
import { LoginForm } from './components/LoginForm'
import { TorrentList } from './components/TorrentList'
import { checkSession } from './api/qbittorrent'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 1000,
		},
	},
})

export default function App() {
	const [authenticated, setAuthenticated] = useState<boolean | null>(null)

	useEffect(() => {
		checkSession().then(setAuthenticated)
	}, [])

	if (authenticated === null) {
		return null
	}

	if (!authenticated) {
		return (
			<ThemeProvider>
				<LoginForm onSuccess={() => setAuthenticated(true)} />
			</ThemeProvider>
		)
	}

	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<Layout>
					<TorrentList />
				</Layout>
			</QueryClientProvider>
		</ThemeProvider>
	)
}
