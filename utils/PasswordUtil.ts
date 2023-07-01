import bcrypt from 'bcrypt';

// Generate Salt for hashing password
export const generateSalt = async () => {
  return await bcrypt.genSalt();
}

// Hash incoming password with Salt
export const hashPassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
}