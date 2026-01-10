import { useState } from 'react'
import { type Instance } from '../api/instances'
import { useRSSManager } from '../hooks/useRSSManager'
import { Checkbox, Select } from '../components/ui'

type Tab = 'feeds' | 'rules'
type View = 'list' | 'articles' | 'editor'

interface Props {
	instances: Instance[]
	onBack: () => void
}

export function MobileRSSManager({ instances, onBack }: Props) {
	const [tab, setTab] = useState<Tab>('feeds')
	const [view, setView] = useState<View>('list')
	const [instanceSelector, setInstanceSelector] = useState(false)

	const rss = useRSSManager({
		instances,
		onViewChange: setView,
	})

	function handleBackButton() {
		if (view !== 'list') {
			setView('list')
			if (tab === 'rules') {
				rss.setSelectedRule(null)
				rss.setEditingRule(null)
			} else {
				rss.setSelectedFeed(null)
			}
		} else {
			onBack()
		}
	}

	return (
		<div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
			<header className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
				<button onClick={handleBackButton} className="p-1 -ml-1" style={{ color: 'var(--text-muted)' }}>
					<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</button>
				<h1 className="text-lg font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
					{view === 'articles' && rss.selectedFeed ? rss.selectedFeed.name :
					 view === 'editor' && rss.selectedRule ? rss.selectedRule :
					 'RSS Manager'}
				</h1>
				{instances.length > 1 && view === 'list' && (
					<button
						onClick={() => setInstanceSelector(true)}
						className="px-2 py-1 rounded text-xs"
						style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
					>
						{rss.selectedInstance?.label}
					</button>
				)}
			</header>

			{view === 'list' && (
				<div className="flex items-center gap-1 p-2 mx-4 mt-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
					{(['feeds', 'rules'] as Tab[]).map((t) => (
						<button
							key={t}
							onClick={() => setTab(t)}
							className="flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all"
							style={{
								backgroundColor: tab === t ? 'var(--bg-primary)' : 'transparent',
								color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
								boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
							}}
						>
							{t}
						</button>
					))}
				</div>
			)}

			{rss.error && (
				<div className="mx-4 mt-3 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', color: 'var(--error)' }}>
					{rss.error}
					<button onClick={rss.clearError} className="ml-2 opacity-70">×</button>
				</div>
			)}

			<div className="flex-1 overflow-y-auto p-4">
				{rss.loading ? (
					<div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
				) : view === 'list' && tab === 'feeds' ? (
					<div className="space-y-3">
						<div className="flex gap-2">
							<button
								onClick={() => rss.setShowAddFeed(true)}
								className="flex-1 py-2.5 rounded-xl text-sm font-medium"
								style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
							>
								Add Feed
							</button>
							<button
								onClick={() => rss.setShowAddFolder(true)}
								className="py-2.5 px-4 rounded-xl text-sm border"
								style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
							>
								Folder
							</button>
						</div>

						{rss.showAddFeed && (
							<div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
								<form onSubmit={rss.handleAddFeed} className="space-y-3">
									<input
										type="url"
										value={rss.feedUrl}
										onChange={(e) => rss.setFeedUrl(e.target.value)}
										className="w-full px-4 py-3 rounded-xl border text-sm"
										style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
										placeholder="Feed URL"
										required
									/>
									<Select
										value={rss.feedPath}
										onChange={rss.setFeedPath}
										options={[
											{ value: '', label: 'None' },
											...rss.feeds.filter(f => f.isFolder).map(f => ({ value: f.path, label: f.path }))
										]}
										minWidth="100%"
										className="h-[46px] [&>button]:h-full [&>button]:rounded-xl [&>button]:px-4 [&>button]:text-sm"
									/>
									<div className="flex gap-2">
										<button type="submit" disabled={rss.submitting} className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}>
											{rss.submitting ? 'Adding...' : 'Add'}
										</button>
										<button type="button" onClick={rss.cancelAddFeed} className="py-2.5 px-4 rounded-xl text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
											Cancel
										</button>
									</div>
								</form>
							</div>
						)}

						{rss.showAddFolder && (
							<div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
								<form onSubmit={rss.handleAddFolder} className="space-y-3">
									<input
										type="text"
										value={rss.folderName}
										onChange={(e) => rss.setFolderName(e.target.value)}
										className="w-full px-4 py-3 rounded-xl border text-sm"
										style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
										placeholder="Folder name"
										required
									/>
									<div className="flex gap-2">
										<button type="submit" disabled={rss.submitting} className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}>
											{rss.submitting ? 'Creating...' : 'Create'}
										</button>
										<button type="button" onClick={rss.cancelAddFolder} className="py-2.5 px-4 rounded-xl text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
											Cancel
										</button>
									</div>
								</form>
							</div>
						)}

						<div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
							{rss.visibleFeeds.length === 0 ? (
								<div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No feeds</div>
							) : (
								rss.visibleFeeds.map((feed) => (
									<div
										key={feed.path}
										className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 active:bg-[var(--bg-tertiary)]"
										style={{ borderColor: 'var(--border)', paddingLeft: `${16 + feed.depth * 16}px` }}
										onClick={() => {
											if (feed.isFolder) {
												rss.toggleFolder(feed.path)
											} else {
												rss.setSelectedFeed(feed)
												setView('articles')
											}
										}}
									>
										{feed.isFolder ? (
											<svg className={`w-5 h-5 shrink-0 transition-transform ${rss.expandedFolders.has(feed.path) ? 'rotate-90' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
											</svg>
										) : (
											<svg className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
											</svg>
										)}
										<span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{feed.name}</span>
										{!feed.isFolder && (
											<div className="flex items-center gap-2">
												<button
													onClick={(e) => { e.stopPropagation(); rss.handleRefresh(feed) }}
													disabled={rss.refreshing === feed.path}
													className="p-1.5 rounded-lg"
													style={{ color: 'var(--text-muted)' }}
												>
													<svg className={`w-4 h-4 ${rss.refreshing === feed.path ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
														<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
													</svg>
												</button>
												<button
													onClick={(e) => { e.stopPropagation(); rss.setDeleteConfirm(feed) }}
													className="p-1.5 rounded-lg"
													style={{ color: 'var(--error)' }}
												>
													<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
														<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
													</svg>
												</button>
											</div>
										)}
										{feed.isFolder && (
											<button
												onClick={(e) => { e.stopPropagation(); rss.setDeleteConfirm(feed) }}
												className="p-1.5 rounded-lg"
												style={{ color: 'var(--error)' }}
											>
												<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
												</svg>
											</button>
										)}
									</div>
								))
							)}
						</div>
					</div>
				) : view === 'articles' && rss.selectedFeed ? (
					<div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
						{rss.feedArticles.length > 0 ? (
							rss.feedArticles.map((article, idx) => (
								<div
									key={article.id || idx}
									className="px-4 py-3 border-b last:border-b-0"
									style={{ borderColor: 'var(--border)' }}
								>
									<div className="text-sm" style={{ color: article.isRead ? 'var(--text-muted)' : 'var(--text-primary)' }}>
										{article.title}
									</div>
									{article.date && (
										<div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
											{new Date(article.date).toLocaleDateString()}
										</div>
									)}
									{article.torrentURL && (
										<div className="mt-2">
											{rss.grabResult?.id === (article.id || String(idx)) ? (
												<span className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: rss.grabResult.success ? 'color-mix(in srgb, #a6e3a1 20%, transparent)' : 'color-mix(in srgb, var(--error) 20%, transparent)', color: rss.grabResult.success ? '#a6e3a1' : 'var(--error)' }}>
													{rss.grabResult.success ? 'Added!' : 'Failed'}
												</span>
											) : instances.length === 1 ? (
												<button
													onClick={() => rss.handleGrabArticle(article.torrentURL!, article.id || String(idx), instances[0].id)}
													disabled={rss.grabbing === (article.id || String(idx))}
													className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
													style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
												>
													{rss.grabbing === (article.id || String(idx)) ? 'Adding...' : 'Download'}
												</button>
											) : (
												<div className="relative inline-block">
													<button
														onClick={() => rss.setInstanceDropdown(rss.instanceDropdown === (article.id || String(idx)) ? null : (article.id || String(idx)))}
														disabled={rss.grabbing === (article.id || String(idx))}
														className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
														style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
													>
														{rss.grabbing === (article.id || String(idx)) ? 'Adding...' : 'Download'}
														<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
															<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
														</svg>
													</button>
													{rss.instanceDropdown === (article.id || String(idx)) && (
														<>
															<div className="fixed inset-0 z-10" onClick={() => rss.setInstanceDropdown(null)} />
															<div className="absolute left-0 top-full mt-1 z-20 min-w-[140px] rounded-xl border shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
																{instances.map(i => (
																	<button
																		key={i.id}
																		onClick={() => rss.handleGrabArticle(article.torrentURL!, article.id || String(idx), i.id)}
																		className="w-full text-left px-4 py-2.5 text-sm active:bg-[var(--bg-tertiary)]"
																		style={{ color: 'var(--text-primary)' }}
																	>
																		{i.label}
																	</button>
																))}
															</div>
														</>
													)}
												</div>
											)}
										</div>
									)}
								</div>
							))
						) : rss.selectedFeed.data?.isLoading ? (
							<div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading feed...</div>
						) : rss.selectedFeed.data?.hasError ? (
							<div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--error)' }}>Failed to load feed</div>
						) : (
							<div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No articles - try refreshing</div>
						)}
					</div>
				) : view === 'list' && tab === 'rules' ? (
					<div className="space-y-3">
						<button
							onClick={() => rss.setShowNewRule(true)}
							className="w-full py-2.5 rounded-xl text-sm font-medium"
							style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
						>
							New Rule
						</button>

						{rss.showNewRule && (
							<div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
								<form onSubmit={rss.handleCreateRule} className="space-y-3">
									<input
										type="text"
										value={rss.newRuleName}
										onChange={(e) => rss.setNewRuleName(e.target.value)}
										className="w-full px-4 py-3 rounded-xl border text-sm"
										style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
										placeholder="Rule name"
										required
									/>
									<div className="flex gap-2">
										<button type="submit" disabled={rss.submitting} className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}>
											{rss.submitting ? 'Creating...' : 'Create'}
										</button>
										<button type="button" onClick={rss.cancelNewRule} className="py-2.5 px-4 rounded-xl text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
											Cancel
										</button>
									</div>
								</form>
							</div>
						)}

						<div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
							{Object.keys(rss.rules).length === 0 ? (
								<div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No rules</div>
							) : (
								Object.entries(rss.rules).map(([name, rule]) => (
									<div
										key={name}
										className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 active:bg-[var(--bg-tertiary)]"
										style={{ borderColor: 'var(--border)' }}
										onClick={() => { rss.setSelectedRule(name); setView('editor') }}
									>
										<div
											className="w-3 h-3 rounded-full shrink-0"
											style={{ backgroundColor: rule.enabled ? '#a6e3a1' : 'var(--text-muted)' }}
										/>
										<span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{name}</span>
										<button
											onClick={(e) => { e.stopPropagation(); rss.setRuleDeleteConfirm(name) }}
											className="p-1.5 rounded-lg"
											style={{ color: 'var(--error)' }}
										>
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								))
							)}
						</div>
					</div>
				) : view === 'editor' && rss.selectedRule && rss.editingRule ? (
					<div className="space-y-4">
						<Checkbox
							label="Enabled"
							checked={rss.editingRule.enabled}
							onChange={(v) => rss.setEditingRule({ ...rss.editingRule!, enabled: v })}
						/>

						<div>
							<label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Must Contain</label>
							<input
								type="text"
								value={rss.editingRule.mustContain}
								onChange={(e) => rss.setEditingRule({ ...rss.editingRule!, mustContain: e.target.value })}
								className="w-full px-4 py-3 rounded-xl border text-sm font-mono"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								placeholder="1080p|720p"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Must NOT Contain</label>
							<input
								type="text"
								value={rss.editingRule.mustNotContain}
								onChange={(e) => rss.setEditingRule({ ...rss.editingRule!, mustNotContain: e.target.value })}
								className="w-full px-4 py-3 rounded-xl border text-sm font-mono"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								placeholder="CAM|TS"
							/>
						</div>

						<div className="flex gap-4">
							<Checkbox
								label="Use Regex"
								checked={rss.editingRule.useRegex}
								onChange={(v) => rss.setEditingRule({ ...rss.editingRule!, useRegex: v })}
							/>
							<Checkbox
								label="Smart Filter"
								checked={rss.editingRule.smartFilter}
								onChange={(v) => rss.setEditingRule({ ...rss.editingRule!, smartFilter: v })}
							/>
						</div>

						<div>
							<label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Episode Filter</label>
							<input
								type="text"
								value={rss.editingRule.episodeFilter}
								onChange={(e) => rss.setEditingRule({ ...rss.editingRule!, episodeFilter: e.target.value })}
								className="w-full px-4 py-3 rounded-xl border text-sm font-mono"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								placeholder="S01E01-S01E10"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</label>
							<select
								value={rss.editingRule.assignedCategory}
								onChange={(e) => rss.setEditingRule({ ...rss.editingRule!, assignedCategory: e.target.value })}
								className="w-full px-4 py-3 rounded-xl border text-sm"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
							>
								<option value="">None</option>
								{Object.keys(rss.categories).map(cat => (
									<option key={cat} value={cat}>{cat}</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Save Path</label>
							<input
								type="text"
								value={rss.editingRule.savePath}
								onChange={(e) => rss.setEditingRule({ ...rss.editingRule!, savePath: e.target.value })}
								className="w-full px-4 py-3 rounded-xl border text-sm font-mono"
								style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
								placeholder="/downloads/tv"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Apply to Feeds</label>
							<div className="max-h-40 overflow-y-auto rounded-xl border p-3 space-y-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
								{rss.feedUrls.length === 0 ? (
									<div className="text-sm py-2 text-center" style={{ color: 'var(--text-muted)' }}>No feeds</div>
								) : (
									rss.feedUrls.map(url => (
										<Checkbox
											key={url}
											label={url}
											checked={rss.editingRule!.affectedFeeds.includes(url)}
											onChange={(checked) => {
												const newFeeds = checked
													? [...rss.editingRule!.affectedFeeds, url]
													: rss.editingRule!.affectedFeeds.filter(f => f !== url)
												rss.setEditingRule({ ...rss.editingRule!, affectedFeeds: newFeeds })
											}}
										/>
									))
								)}
							</div>
						</div>

						<div className="flex gap-2 pt-2">
							<button
								onClick={rss.handleSaveRule}
								disabled={rss.savingRule}
								className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
								style={{ backgroundColor: rss.ruleSaved ? '#a6e3a1' : 'var(--accent)', color: rss.ruleSaved ? '#1e1e2e' : 'var(--accent-contrast)' }}
							>
								{rss.savingRule ? 'Saving...' : rss.ruleSaved ? 'Saved!' : 'Save'}
							</button>
							<button
								onClick={rss.handleCancelEdit}
								className="py-3 px-4 rounded-xl text-sm border"
								style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
							>
								Cancel
							</button>
							<button
								onClick={rss.handlePreviewMatches}
								disabled={rss.loadingMatches}
								className="py-3 px-4 rounded-xl text-sm border disabled:opacity-50"
								style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
							>
								{rss.loadingMatches ? '...' : 'Preview'}
							</button>
						</div>

						{rss.matchingArticles && (
							<div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
								<div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
									Matching Articles
								</div>
								<div className="max-h-48 overflow-y-auto rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
									{Object.keys(rss.matchingArticles).length === 0 ? (
										<div className="text-sm py-2 text-center" style={{ color: 'var(--text-muted)' }}>No matches</div>
									) : (
										Object.entries(rss.matchingArticles).map(([feedName, matchedTitles]) => (
											<div key={feedName} className="mb-3 last:mb-0">
												<div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{feedName}</div>
												{matchedTitles.map((title, i) => (
													<div key={i} className="text-xs pl-2 mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
														{title}
													</div>
												))}
											</div>
										))
									)}
								</div>
							</div>
						)}
					</div>
				) : null}
			</div>

			{rss.deleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-end p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="w-full rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
						<h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete {rss.deleteConfirm.isFolder ? 'Folder' : 'Feed'}</h3>
						<p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
							Delete <strong style={{ color: 'var(--text-primary)' }}>{rss.deleteConfirm.name}</strong>?
						</p>
						<div className="flex gap-3">
							<button onClick={() => rss.setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
							<button onClick={rss.handleDeleteItem} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'var(--error)', color: 'white' }}>Delete</button>
						</div>
					</div>
				</div>
			)}

			{rss.ruleDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-end p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="w-full rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
						<h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Rule</h3>
						<p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
							Delete <strong style={{ color: 'var(--text-primary)' }}>{rss.ruleDeleteConfirm}</strong>?
						</p>
						<div className="flex gap-3">
							<button onClick={() => rss.setRuleDeleteConfirm(null)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
							<button onClick={rss.handleDeleteRule} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'var(--error)', color: 'white' }}>Delete</button>
						</div>
					</div>
				</div>
			)}

			{instanceSelector && (
				<div className="fixed inset-0 z-50 flex items-end p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setInstanceSelector(false)}>
					<div className="w-full rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
						<div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
							Select Instance
						</div>
						{instances.map(inst => (
							<button
								key={inst.id}
								onClick={() => { rss.selectInstance(inst); setInstanceSelector(false); setView('list') }}
								className="w-full px-4 py-3 text-left text-sm border-b last:border-b-0 active:bg-[var(--bg-tertiary)]"
								style={{ borderColor: 'var(--border)', color: rss.selectedInstance?.id === inst.id ? 'var(--accent)' : 'var(--text-primary)' }}
							>
								{inst.label}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
