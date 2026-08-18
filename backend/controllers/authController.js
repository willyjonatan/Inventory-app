const { findUserByEmail, createUser, generateToken, verifyPassword } = require('../config/auth');
const { db } = require('../config/firebase');

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validasi
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Cek email sudah terdaftar
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Buat user baru
        const newUser = await createUser({ name, email, password });
        
        // Generate token
        const token = generateToken(newUser.id, newUser.email, newUser.name);
        
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Cari user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Verifikasi password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Generate token
        const token = generateToken(user.id, user.email, user.name);
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userData = doc.data();
        res.json({
            id: doc.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
};