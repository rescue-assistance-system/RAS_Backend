export function getSearchString(search: any): string {
    if (typeof search === 'object') {
        return JSON.stringify(search)
    } else if (Array.isArray(search)) {
        return search.join(',')
    } else {
        return search.toString()
    }
}
