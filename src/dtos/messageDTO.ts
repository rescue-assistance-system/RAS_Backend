import Message from '~/database/models/message.model'

export class MessageDTO {
    id: number = 0
    caseId: number = 0
    fromId: number = 0
    content: string = ''
    contentType: string = 'TEXT'
    createdAt: Date = new Date()
    senderName?: string = undefined
}

export function convertToDTO(message: Message): MessageDTO {
    return {
        id: message.id,
        caseId: message.case_id,
        fromId: message.from_id,
        content: message.content,
        contentType: message.contentType,
        senderName: message.sender_name,
        createdAt: message.created_at
    }
}
