// lib/ironSession.js
import { withIronSession } from 'next-iron-session';

export default function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.SESSION_SECRET || 'your-secret-key', // Use your own secret key
    cookieName: 'qrm_session',
    // Other configuration options if needed
  });
}
