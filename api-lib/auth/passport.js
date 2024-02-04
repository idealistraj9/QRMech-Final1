import { findUserForAuth, findUserWithEmailAndPassword } from '@/api-lib/db';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getMongoDb } from '../mongodb';

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((req, id, done) => {
  getMongoDb().then((db) => {
    findUserForAuth(db, id).then(
      (user) => done(null, user),
      (err) => done(err)
    );
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    async (req, email, password, done) => {
      const db = await getMongoDb();
      const user = await findUserWithEmailAndPassword(db, email, password);

      if (user) {
        // Check the user's role
        const { role } = user;

        if (role === 'admin') {
          // Redirect to the admin page
          req.session.redirectTo = '/admin';
        }

        done(null, user);
      } else {
        done(null, false, { message: 'Email or password is incorrect' });
      }
    }
  )
);

export default passport;
