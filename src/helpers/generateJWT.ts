import jwt from 'jsonwebtoken';

const secret = 'La_clave_secreta_red_social_mean_stack';

const generateJWT = (id: String) => {
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export default generateJWT;
