export const createResponse = (status: string, data: any = null, error: any = null) => {
    return {
        status,
        data,
        error
    }
}
