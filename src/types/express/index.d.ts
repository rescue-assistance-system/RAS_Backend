import { UserPayload } from '../User'
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload
        }
    }
}
