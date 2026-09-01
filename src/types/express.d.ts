import { IUser } from "../models/User";

// Makes `req.user` (set by Passport after login) properly typed as our IUser
// document everywhere, instead of Passport's generic/empty User interface.
// This avoids needing `req.user as IUser` casts in every controller.
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUser {}
  }
}
