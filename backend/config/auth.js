const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('./firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT Token
const generateToken = (userId, email, name) => {
    return jwt.sign(
        { userId, email, name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Verify JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Find user by email
const findUserByEmail = async (email) => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        
        if (snapshot.empty) {
            return null;
        }
        
        let user = null;
        snapshot.forEach(doc => {
            user = { id: doc.id, ...doc.data() };
        });
        return user;
    } catch (error) {
        throw error;
    }
};

// Create user
const createUser = async (userData) => {
    try {
        const usersRef = db.collection('users');
        const hashedPassword = await hashPassword(userData.password);
        
        const newUser = {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'user',
            createdAt: new Date().toISOString()
        };
        
        const docRef = await usersRef.add(newUser);
        return { id: docRef.id, ...newUser };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    findUserByEmail,
    createUser,
    JWT_SECRET
};