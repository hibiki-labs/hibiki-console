import { SessionOptions } from 'iron-session';

export default function getSessionOptions(): SessionOptions {
  const sessionOptions: SessionOptions = {
    cookieName: process.env.SESSION_COOKIE_NAME ?? 'app',
    password: process.env.SESSION_COOKIE_PASSWORD ?? 'abcdefghijklmnopqrstuvwxyz01234567890',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.SESSION_MAX_AGE_SECONDS ?? '120', 10), // 2 minutes
    },
  };

  return sessionOptions;
}
