import { SocketService } from '~/sockets/SocketService'

export class CallService {
    public async receivedCall(
        userId: string,
        friendId: string,
        name: string,
        avatar: string,
        type: string
    ): Promise<boolean> {
        if (type === 'VIDEO_CALL') {
            return await SocketService.getInstance().handleFriendCallRinging(userId, friendId, name, avatar)
        } else {
            return await SocketService.getInstance().handleFriendAudioCallRinging(userId, friendId, name, avatar)
        }
    }
}
