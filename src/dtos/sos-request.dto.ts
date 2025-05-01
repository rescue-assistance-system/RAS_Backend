export interface SosRequestDto {
    userId: string
    latitude: number
    longitude: number
    address: string
}

export interface SosResponseDto {
    teamId: string
    userId: string
    latitude: number
    longitude: number
    address: string
}
