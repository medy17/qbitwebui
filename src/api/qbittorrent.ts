import JSZip from 'jszip'
import type { Torrent, TorrentFilter, TransferInfo, SyncMaindata } from '../types/qbittorrent'
import type { TorrentProperties, Tracker, PeersResponse, TorrentFile, WebSeed } from '../types/torrentDetails'

function getBase(instanceId: number): string {
	return `/api/instances/${instanceId}/qbt/v2`
}

async function request<T>(instanceId: number, endpoint: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${getBase(instanceId)}${endpoint}`, {
		...options,
		credentials: 'include',
	})
	if (!res.ok) {
		throw new Error(`API error: ${res.status}`)
	}
	const text = await res.text()
	if (!text) {
		throw new Error('Empty response from API')
	}
	try {
		return JSON.parse(text)
	} catch {
		throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`)
	}
}

export interface TorrentFilterOptions {
	filter?: TorrentFilter
	category?: string
	tag?: string
}

export async function getTorrents(instanceId: number, options: TorrentFilterOptions = {}): Promise<Torrent[]> {
	const params = new URLSearchParams()
	if (options.filter && options.filter !== 'all') params.set('filter', options.filter)
	if (options.category) params.set('category', options.category)
	if (options.tag) params.set('tag', options.tag)
	const query = params.toString()
	return request<Torrent[]>(instanceId, `/torrents/info${query ? `?${query}` : ''}`)
}

export async function getTransferInfo(instanceId: number): Promise<TransferInfo> {
	return request<TransferInfo>(instanceId, '/transfer/info')
}

export async function getSyncMaindata(instanceId: number): Promise<SyncMaindata> {
	return request<SyncMaindata>(instanceId, '/sync/maindata?rid=0')
}

export async function stopTorrents(instanceId: number, hashes: string[]): Promise<void> {
	await request(instanceId, '/torrents/stop', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hashes: hashes.join('|') }),
	})
}

export async function startTorrents(instanceId: number, hashes: string[]): Promise<void> {
	await request(instanceId, '/torrents/start', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hashes: hashes.join('|') }),
	})
}

export async function deleteTorrents(instanceId: number, hashes: string[], deleteFiles = false): Promise<void> {
	await request(instanceId, '/torrents/delete', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			hashes: hashes.join('|'),
			deleteFiles: deleteFiles.toString(),
		}),
	})
}

export interface AddTorrentOptions {
	urls?: string
	savepath?: string
	category?: string
	tags?: string
	paused?: boolean
	sequentialDownload?: boolean
	firstLastPiecePrio?: boolean
	autoTMM?: boolean
}

export async function addTorrent(instanceId: number, options: AddTorrentOptions, files?: File[]): Promise<void> {
	const formData = new FormData()
	if (files) {
		files.forEach(file => formData.append('torrents', file))
	}
	if (options.urls) {
		formData.append('urls', options.urls)
	}
	if (options.savepath) {
		formData.append('savepath', options.savepath)
	}
	if (options.category) {
		formData.append('category', options.category)
	}
	if (options.tags) {
		formData.append('tags', options.tags)
	}
	if (options.paused !== undefined) {
		formData.append('paused', options.paused.toString())
	}
	if (options.sequentialDownload) {
		formData.append('sequentialDownload', 'true')
	}
	if (options.firstLastPiecePrio) {
		formData.append('firstLastPiecePrio', 'true')
	}
	if (options.autoTMM !== undefined) {
		formData.append('autoTMM', options.autoTMM.toString())
	}
	const res = await fetch(`${getBase(instanceId)}/torrents/add`, {
		method: 'POST',
		credentials: 'include',
		body: formData,
	})
	if (!res.ok) {
		throw new Error(`Failed to add torrent: ${res.status}`)
	}
}

export interface Category {
	name: string
	savePath: string
}

export async function getCategories(instanceId: number): Promise<Record<string, Category>> {
	return request<Record<string, Category>>(instanceId, '/torrents/categories')
}

export async function getTorrentProperties(instanceId: number, hash: string): Promise<TorrentProperties> {
	return request<TorrentProperties>(instanceId, `/torrents/properties?hash=${hash}`)
}

export async function getTorrentTrackers(instanceId: number, hash: string): Promise<Tracker[]> {
	return request<Tracker[]>(instanceId, `/torrents/trackers?hash=${hash}`)
}

export async function getTorrentPeers(instanceId: number, hash: string): Promise<PeersResponse> {
	return request<PeersResponse>(instanceId, `/sync/torrentPeers?hash=${hash}`)
}

export async function getTorrentFiles(instanceId: number, hash: string): Promise<TorrentFile[]> {
	return request<TorrentFile[]>(instanceId, `/torrents/files?hash=${hash}`)
}

export async function getTorrentWebSeeds(instanceId: number, hash: string): Promise<WebSeed[]> {
	return request<WebSeed[]>(instanceId, `/torrents/webseeds?hash=${hash}`)
}

export async function setCategory(instanceId: number, hashes: string[], category: string): Promise<void> {
	await request(instanceId, '/torrents/setCategory', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hashes: hashes.join('|'), category }),
	})
}

export async function addTags(instanceId: number, hashes: string[], tags: string): Promise<void> {
	await request(instanceId, '/torrents/addTags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hashes: hashes.join('|'), tags }),
	})
}

export async function removeTags(instanceId: number, hashes: string[], tags: string): Promise<void> {
	await request(instanceId, '/torrents/removeTags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hashes: hashes.join('|'), tags }),
	})
}

export async function getTags(instanceId: number): Promise<string[]> {
	return request<string[]>(instanceId, '/torrents/tags')
}

export async function createTags(instanceId: number, tags: string): Promise<void> {
	await request(instanceId, '/torrents/createTags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ tags }),
	})
}

export async function deleteTags(instanceId: number, tags: string): Promise<void> {
	await request(instanceId, '/torrents/deleteTags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ tags }),
	})
}

export async function createCategory(instanceId: number, category: string, savePath?: string): Promise<void> {
	const params: Record<string, string> = { category }
	if (savePath) params.savePath = savePath
	await request(instanceId, '/torrents/createCategory', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(params),
	})
}

export async function removeCategories(instanceId: number, categories: string[]): Promise<void> {
	await request(instanceId, '/torrents/removeCategories', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ categories: categories.join('\n') }),
	})
}

export async function setFilePriority(instanceId: number, hash: string, ids: number[], priority: number): Promise<void> {
	await request(instanceId, '/torrents/filePrio', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hash, id: ids.join('|'), priority: priority.toString() }),
	})
}

export async function renameTorrent(instanceId: number, hash: string, name: string): Promise<void> {
	await request(instanceId, '/torrents/rename', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hash, name }),
	})
}

export async function addTrackers(instanceId: number, hash: string, urls: string[]): Promise<void> {
	await request(instanceId, '/torrents/addTrackers', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hash, urls: urls.join('\n') }),
	})
}

export async function removeTrackers(instanceId: number, hash: string, urls: string[]): Promise<void> {
	await request(instanceId, '/torrents/removeTrackers', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ hash, urls: urls.join('|') }),
	})
}

async function fetchTorrentBlob(instanceId: number, hash: string): Promise<Blob> {
	const res = await fetch(`${getBase(instanceId)}/torrents/export?hash=${hash}`, { credentials: 'include' })
	if (!res.ok) throw new Error(`Export failed: ${res.status}`)
	return res.blob()
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

export async function exportTorrents(instanceId: number, torrents: { hash: string; name: string }[]): Promise<void> {
	if (torrents.length === 1) {
		const blob = await fetchTorrentBlob(instanceId, torrents[0].hash)
		downloadBlob(blob, `${torrents[0].name}.torrent`)
		return
	}
	const zip = new JSZip()
	for (const t of torrents) {
		const blob = await fetchTorrentBlob(instanceId, t.hash)
		zip.file(`${t.name}.torrent`, blob)
	}
	const zipBlob = await zip.generateAsync({ type: 'blob' })
	downloadBlob(zipBlob, 'torrents.zip')
}
