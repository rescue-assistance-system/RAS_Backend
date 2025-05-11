export class SosMessageDto {
    message: string = ''
    teamId?: number
    userId?: number
    caseId?: number
    userName?: string
    latitude?: number
    longitude?: number
    address?: string
    status?: string

    constructor(init?: Partial<SosMessageDto>) {
        Object.assign(this, init)
    }
}
