import 'express-session';

declare module 'express-session' {
  interface SessionData {
    account: 'user' | 'judge' | 'admin';
    user_id: string;
    minicode: string;
  }
}