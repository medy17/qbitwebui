import { useState } from 'react'
import { login } from '../api/qbittorrent'

interface Props {
	onSuccess: () => void
}

export function LoginForm({ onSuccess }: Props) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const ok = await login(username, password)
			if (ok) {
				onSuccess()
			} else {
				setError('Invalid credentials')
			}
		} catch {
			setError('Connection failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
			<div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top, color-mix(in srgb, var(--accent) 8%, var(--bg-primary)), var(--bg-primary))' }} />
			<div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 5%, transparent)' }} />

			<form
				onSubmit={handleSubmit}
				className="relative w-full max-w-sm opacity-0 animate-in"
			>
				<div className="absolute -inset-px rounded-2xl" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, white 8%, transparent), transparent)' }} />
				<div className="relative backdrop-blur-xl rounded-2xl p-8 border" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 80%, transparent)', borderColor: 'var(--border)' }}>
					<div className="flex items-center gap-3 mb-8">
						<div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--accent), color-mix(in srgb, var(--accent) 70%, black))' }}>
							<svg className="w-5 h-5" style={{ color: 'var(--accent-contrast)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
							</svg>
						</div>
						<div>
							<h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>qbitwebui</h1>
						</div>
					</div>

					{error && (
						<div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--error) 20%, transparent)', color: 'var(--error)' }}>
							{error}
						</div>
					)}

					<div className="space-y-4">
						<div className="group">
							<label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
								Username
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full px-4 py-3 rounded-lg border text-sm font-mono transition-all duration-200"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								placeholder="admin"
								autoComplete="username"
							/>
						</div>

						<div className="group">
							<label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 rounded-lg border text-sm font-mono transition-all duration-200"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								placeholder="••••••••"
								autoComplete="current-password"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="relative w-full mt-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ background: 'linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 80%, black))' }}
					>
						<span className="relative font-semibold" style={{ color: 'var(--accent-contrast)' }}>
							{loading ? 'Connecting...' : 'Sign In'}
						</span>
					</button>

					<p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
						Secure connection to your qBittorrent instance
					</p>
				</div>
			</form>
		</div>
	)
}
