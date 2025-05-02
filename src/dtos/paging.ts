export class Paging<T> {
    content: T[]
    totalItems: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean

    constructor(content: T[], totalItems: number, currentPage: number, pageSize: number) {
        this.content = content
        this.totalItems = totalItems
        this.currentPage = currentPage
        this.totalPages = Math.ceil(totalItems / pageSize)
        this.hasNextPage = currentPage < this.totalPages
    }
}

export class ConversationPaging<T> {
    lastMessages: T[]
    totalItems: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean

    constructor(lastMessages: T[], totalItems: number, currentPage: number, pageSize: number) {
        this.lastMessages = lastMessages
        this.totalItems = totalItems
        this.currentPage = currentPage
        this.totalPages = Math.ceil(totalItems / pageSize)
        this.hasNextPage = currentPage < this.totalPages
    }
}
