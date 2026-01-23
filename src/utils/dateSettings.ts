export function loadHideAddedTime(): boolean {
	return localStorage.getItem('hideAddedTime') === 'true'
}

export function saveHideAddedTime(hide: boolean): void {
	localStorage.setItem('hideAddedTime', String(hide))
}
