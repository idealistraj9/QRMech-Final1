import { ValidateProps } from '@/api-lib/constants';
import { findUserByEmail, findUserByUsername, insertUser } from '@/api-lib/db';
import { auths, validateBody } from '@/api-lib/middlewares';
import { getMongoDb } from '@/api-lib/mongodb';
import { ncOpts } from '@/api-lib/nc';
import { slugUsername } from '@/lib/user';
import nc from 'next-connect';
import isEmail from 'validator/lib/isEmail';
import normalizeEmail from 'validator/lib/normalizeEmail';

const handler = nc(ncOpts);

handler.post(
  validateBody({
    type: 'object',
    properties: {
      username: ValidateProps.user.username,
      name: ValidateProps.user.name,
      password: ValidateProps.user.password,
      email: ValidateProps.user.email,
      Ebikenickname: ValidateProps.user.Ebikenickname,
      Ebikemodelname: ValidateProps.user.Ebikemodelname,
      Ebikenoplate: ValidateProps.user.Ebikenoplate,
    },
    required: ['username', 'name', 'password', 'email','Ebikenickname','Ebikemodelname','Ebikenoplate'],
    additionalProperties: false,
  }),
  ...auths,
  async (req, res) => {
    const db = await getMongoDb();

    let { username, name, email, password ,Ebikenickname ,Ebikemodelname , Ebikenoplate } = req.body;
    username = slugUsername(req.body.username);
    email = normalizeEmail(req.body.email);
    if (!isEmail(email)) {
      res
        .status(400)
        .json({ error: { message: 'The email you entered is invalid.' } });
      return;
    }
    if (await findUserByEmail(db, email)) {
      res
        .status(403)
        .json({ error: { message: 'The email has already been used.' } });
      return;
    }
    if (await findUserByUsername(db, username)) {
      res
        .status(403)
        .json({ error: { message: 'The username has already been taken.' } });
      return;
    }
    const user = await insertUser(db, {
      email,
      originalPassword: password,
      bio: '',
      name,
      username,
      Ebikenickname,
      Ebikemodelname,
      Ebikenoplate,
      credit:0,
    });
    req.logIn(user, (err) => {
      if (err) throw err;
      res.status(201).json({
        user,
      });
    });
  }
);

export default handler;
