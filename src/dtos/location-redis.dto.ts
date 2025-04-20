export class LocationRedisDto {
    constructor(
        public userId: string,
        public latitude: number,
        public longitude: number,
        public timestamp: string
    ) {}
}
