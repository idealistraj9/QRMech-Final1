export const ValidateProps = {
  user: {
    username: { type: 'string', minLength: 4, maxLength: 20 },
    name: { type: 'string', minLength: 1, maxLength: 50 },
    password: { type: 'string', minLength: 8 },
    email: { type: 'string', minLength: 1 },
    bio: { type: 'string', minLength: 0, maxLength: 160 },
    Ebikenickname: { type: 'string', minLength: 1, maxLength: 50 },
    Ebikemodelname: { type: 'string', minLength: 1, maxLength: 50 },
    Ebikenoplate: { type: 'string', minLength: 1, maxLength: 50 },
    credit:{type: 'integer', minLength: 1, maxLength: 50},
    role:{type: 'string', minLength: 1, maxLength: 50},
  },
  
};
