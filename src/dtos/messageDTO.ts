import Message from '~/database/models/message.model'

export class MessageDTO {
    id: number = 0
    caseId: number = 0
    fromId: number = 0
    content: string = ''
    content_type: string = 'TEXT'
    createdAt: Date = new Date()
    senderId?: number = undefined
    senderName?: string = undefined
    avatar?: string = undefined
    duration?: number = undefined
}

export function convertToDTO(message: any): MessageDTO {
    return {
        id: message.id,
        caseId: message.case_id,
        fromId: message.from_id,
        content: message.content,
        content_type: message.content_type,
        senderId: message.sender_id || null,
        senderName: message.sender?.username || message.sender_name || null,
        createdAt: message.created_at,
        avatar: message.sender?.avatar || message.avatar || null,
        duration: message.duration
    }
}

export class MessageInfoDTO {
    caseId: number = 0
    userId: number = 0
    avatar?: string = undefined
    userName?: string = undefined

    constructor(message: MessageInfoDTO) {
        this.caseId = message.caseId
        this.userId = message.userId
        this.avatar = message.avatar
        this.userName = message.userName
    }
}
