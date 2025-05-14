import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY || 'your-secret-key';

export function generateToken(questionId: string): string {
  const token = jwt.sign({ questionId }, secretKey, { expiresIn: '2h' });
  return token;
}