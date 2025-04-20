export const getPagination = (page = 1, limit = 10) => {
    const safeLimit = Number.isNaN(Number(limit)) || Number(limit) < 1 ? 10 : Number(limit)
    const safePage = Number.isNaN(Number(page)) || Number(page) < 1 ? 1 : Number(page)
    const offset = (safePage - 1) * safeLimit
    return { limit: safeLimit, offset, page: safePage }
}

export const formatPaginatedData = (totalItems: number, items: any[], page: number, limit: number) => {
    const totalPages = Math.ceil(totalItems / limit)
    return {
        currentPage: page,
        totalPages,
        totalItems,
        items
    }
}
