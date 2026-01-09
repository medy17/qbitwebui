import { useState } from 'react'
import { useCategories, useTags, useCreateCategory, useEditCategory, useDeleteCategory, useCreateTag, useDeleteTag } from '../hooks/useTorrents'

interface Props {
	open: boolean
	onClose: () => void
}

type Tab = 'categories' | 'tags'

export function CategoryTagManager({ open, onClose }: Props) {
	const [tab, setTab] = useState<Tab>('categories')
	const [newCategoryName, setNewCategoryName] = useState('')
	const [newCategorySavePath, setNewCategorySavePath] = useState('')
	const [newTag, setNewTag] = useState('')
	const [editingCategory, setEditingCategory] = useState<string | null>(null)
	const [editSavePath, setEditSavePath] = useState('')

	const { data: categories = {} } = useCategories()
	const { data: tags = [] } = useTags()
	const createCategoryMutation = useCreateCategory()
	const editCategoryMutation = useEditCategory()
	const deleteCategoryMutation = useDeleteCategory()
	const createTagMutation = useCreateTag()
	const deleteTagMutation = useDeleteTag()

	if (!open) return null

	function handleCreateCategory(e: React.FormEvent) {
		e.preventDefault()
		if (!newCategoryName.trim()) return
		createCategoryMutation.mutate({ name: newCategoryName.trim(), savePath: newCategorySavePath.trim() || undefined }, {
			onSuccess: () => {
				setNewCategoryName('')
				setNewCategorySavePath('')
			},
		})
	}

	function handleEditCategory(name: string) {
		if (!editSavePath.trim() && editSavePath !== '') return
		editCategoryMutation.mutate({ name, savePath: editSavePath }, {
			onSuccess: () => setEditingCategory(null),
		})
	}

	function startEditCategory(name: string, currentPath: string) {
		setEditingCategory(name)
		setEditSavePath(currentPath)
	}

	function handleCreateTag(e: React.FormEvent) {
		e.preventDefault()
		if (!newTag.trim()) return
		createTagMutation.mutate(newTag.trim(), {
			onSuccess: () => setNewTag(''),
		})
	}

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="relative w-full max-w-lg mx-4 opacity-0 animate-in">
				<div className="absolute -inset-px rounded-2xl" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 20%, transparent), transparent)' }} />
				<div className="relative rounded-2xl border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}>
					<div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
								<svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
									<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
								</svg>
							</div>
							<h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Manage Categories & Tags</h3>
						</div>
						<button onClick={onClose} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="p-5 space-y-4">
						<div className="flex p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
							<button
								type="button"
								onClick={() => setTab('categories')}
								className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all"
								style={{
									backgroundColor: tab === 'categories' ? 'var(--accent)' : 'transparent',
									color: tab === 'categories' ? 'var(--accent-contrast)' : 'var(--text-muted)',
								}}
							>
								Categories
							</button>
							<button
								type="button"
								onClick={() => setTab('tags')}
								className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all"
								style={{
									backgroundColor: tab === 'tags' ? 'var(--accent)' : 'transparent',
									color: tab === 'tags' ? 'var(--accent-contrast)' : 'var(--text-muted)',
								}}
							>
								Tags
							</button>
						</div>

						{tab === 'categories' ? (
							<div className="space-y-3">
								<div className="max-h-64 overflow-y-auto space-y-1">
									{Object.entries(categories).length === 0 ? (
										<div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No categories</div>
									) : (
										Object.entries(categories).map(([name, cat]) => (
											<div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
												{editingCategory === name ? (
													<>
														<span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-primary)' }}>{name}</span>
														<input
															type="text"
															value={editSavePath}
															onChange={(e) => setEditSavePath(e.target.value)}
															onKeyDown={(e) => { if (e.key === 'Enter') handleEditCategory(name); if (e.key === 'Escape') setEditingCategory(null) }}
															placeholder="Save path"
															autoFocus
															className="flex-1 px-2 py-1 rounded border text-xs focus:outline-none"
															style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
														/>
														<button onClick={() => handleEditCategory(name)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--success)' }}>
															<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
															</svg>
														</button>
														<button onClick={() => setEditingCategory(null)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
															<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
															</svg>
														</button>
													</>
												) : (
													<>
														<span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
														<span className="text-xs truncate flex-1" style={{ color: 'var(--text-muted)' }}>{cat.savePath || '(default)'}</span>
														<button onClick={() => startEditCategory(name, cat.savePath)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
															<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																<path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
															</svg>
														</button>
														<button
															onClick={() => deleteCategoryMutation.mutate(name)}
															disabled={deleteCategoryMutation.isPending}
															className="p-1 rounded hover:opacity-70"
															style={{ color: 'var(--error)' }}
														>
															<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
															</svg>
														</button>
													</>
												)}
											</div>
										))
									)}
								</div>
								<form onSubmit={handleCreateCategory} className="flex gap-2">
									<input
										type="text"
										value={newCategoryName}
										onChange={(e) => setNewCategoryName(e.target.value)}
										placeholder="Name"
										className="flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none"
										style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
									/>
									<input
										type="text"
										value={newCategorySavePath}
										onChange={(e) => setNewCategorySavePath(e.target.value)}
										placeholder="Save path (optional)"
										className="flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none"
										style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
									/>
									<button
										type="submit"
										disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
										className="px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
										style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
									>
										Add
									</button>
								</form>
							</div>
						) : (
							<div className="space-y-3">
								<div className="max-h-64 overflow-y-auto space-y-1">
									{tags.length === 0 ? (
										<div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No tags</div>
									) : (
										tags.map((tag) => (
											<div key={tag} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
												<span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tag}</span>
												<button
													onClick={() => deleteTagMutation.mutate(tag)}
													disabled={deleteTagMutation.isPending}
													className="p-1 rounded hover:opacity-70"
													style={{ color: 'var(--error)' }}
												>
													<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
														<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
													</svg>
												</button>
											</div>
										))
									)}
								</div>
								<form onSubmit={handleCreateTag} className="flex gap-2">
									<input
										type="text"
										value={newTag}
										onChange={(e) => setNewTag(e.target.value)}
										placeholder="New tag name"
										className="flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none"
										style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
									/>
									<button
										type="submit"
										disabled={!newTag.trim() || createTagMutation.isPending}
										className="px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
										style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
									>
										Add
									</button>
								</form>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
