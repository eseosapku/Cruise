const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token
    };
  }

  async register(userData) {
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token
    };
  }

  async logout(userId) {
    // Implement token blacklisting or session invalidation
    return { success: true };
  }
}

module.exports = new AuthService();
