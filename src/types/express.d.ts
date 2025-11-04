// src/types/express.d.ts
import { User } from 'src/user/user-entity';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<User> & { id: string; email: string; role: string };
    }
  }
}
