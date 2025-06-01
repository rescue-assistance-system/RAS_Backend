export class CallingMessageDTO {
    type: string = ''
    fromId: string = '0'
    toId: string = '0'
    name: string = ''
    avatar: string = ''
    data: any = null
    createdAt: string = new Date().toISOString()
}
