export const ValidateProps = {
  user: {
    username: { type: 'string', minLength: 4, maxLength: 20 },
    name: { type: 'string', minLength: 1, maxLength: 50 },
    password: { type: 'string', minLength: 8 },
    email: { type: 'string', minLength: 1 },
    bio: { type: 'string', minLength: 0, maxLength: 160 },
    carnickname: { type: 'string', minLength: 1, maxLength: 50 },
    carmodelname: { type: 'string', minLength: 1, maxLength: 50 },
    carnoplate: { type: 'string', minLength: 1, maxLength: 50 },
    credit:{type: 'integer', minLength: 1, maxLength: 50},
  },
  post: {
    content: { type: 'string', minLength: 1, maxLength: 280 },
  },
  comment: {
    content: { type: 'string', minLength: 1, maxLength: 280 },
  },
};
