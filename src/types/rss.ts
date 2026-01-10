export interface RSSArticle {
	id: string
	title: string
	torrentURL?: string
	link?: string
	description?: string
	date: string
	isRead?: boolean
}

export interface RSSFeedData {
	uid: string
	url: string
	title?: string
	lastBuildDate?: string
	isLoading?: boolean
	hasError?: boolean
	articles?: RSSArticle[]
}

export type RSSItems = {
	[key: string]: string | RSSFeedData | RSSItems
}

export interface RSSRule {
	enabled: boolean
	mustContain: string
	mustNotContain: string
	useRegex: boolean
	episodeFilter: string
	smartFilter: boolean
	previouslyMatchedEpisodes: string[]
	affectedFeeds: string[]
	ignoreDays: number
	lastMatch: string
	addPaused: boolean | null
	assignedCategory: string
	savePath: string
	torrentParams?: {
		category?: string
		tags?: string[]
		save_path?: string
		use_auto_tmm?: boolean
		stopped?: boolean | null
		content_layout?: string | null
	}
}

export type RSSRules = Record<string, RSSRule>

export interface MatchingArticles {
	[feedName: string]: string[]
}
