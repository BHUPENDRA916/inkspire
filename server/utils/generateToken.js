import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role, canteenId) => {
  const token = jwt.sign(
    { userId, role, canteenId },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );

  // Note: For simplicity, we send the token in the response body.
  // For production, setting an httpOnly cookie is more secure.
  /*
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  */

  return token;
};

export default generateToken;