import { UserPrincipal } from '@shared/security/user-principal';

declare global {
    namespace Express {
        interface Request {
            user?: UserPrincipal;
        }
    }
}

export { };