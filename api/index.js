const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia123';

app.use(cors());
app.use(express.json());

// ============================================
// FIREBASE CONFIG - PAKAI ENV VARIABLE
// ============================================
const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: 'googleapis.com'
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// ============================================
// MIDDLEWARE AUTH
// ============================================
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token tidak valid' });
    }
};

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Inventory API running on Vercel' });
});

// ============================================
// CEK EMAIL & NAMA
// ============================================
app.post('/api/auth/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        res.json({ exists: !snapshot.empty });
    } catch (error) {
        res.json({ exists: false });
    }
});

app.post('/api/auth/check-name', async (req, res) => {
    try {
        const { name } = req.body;
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('name', '==', name).get();
        res.json({ exists: !snapshot.empty });
    } catch (error) {
        res.json({ exists: false });
    }
});

// ============================================
// REGISTER
// ============================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }
        
        if (!email.endsWith('@gmail.com')) {
            return res.status(400).json({ error: 'Email harus menggunakan @gmail.com' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password minimal 8 karakter' });
        }
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        if (!hasUpperCase) {
            return res.status(400).json({ error: 'Password harus diawali huruf besar' });
        }
        
        if (!hasNumber) {
            return res.status(400).json({ error: 'Password harus mengandung angka' });
        }
        
        const usersRef = db.collection('users');
        const emailExists = await usersRef.where('email', '==', email).get();
        if (!emailExists.empty) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }
        
        const nameExists = await usersRef.where('name', '==', name).get();
        if (!nameExists.empty) {
            return res.status(400).json({ error: 'Nama sudah digunakan' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        const docRef = await usersRef.add(newUser);
        
        res.status(201).json({
            message: 'Registrasi berhasil! Silakan login.',
            user: { id: docRef.id, name, email, role: 'user' }
        });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registrasi gagal' });
    }
});

// ============================================
// LOGIN
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();
        
        if (snapshot.empty) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        
        let userData, userId;
        snapshot.forEach(doc => {
            userId = doc.id;
            userData = doc.data();
        });
        
        const isValid = await bcrypt.compare(password, userData.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        
        const token = jwt.sign(
            { userId, email: userData.email, name: userData.name, role: userData.role || 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: userId,
                name: userData.name,
                email: userData.email,
                role: userData.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login gagal' });
    }
});

// ============================================
// ITEMS CRUD - DENGAN FILTER USER
// ============================================

// GET - Ambil data
app.get('/api/items', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        const itemsRef = db.collection('items');
        let snapshot;
        
        if (userRole === 'admin') {
            snapshot = await itemsRef.get();
        } else {
            snapshot = await itemsRef.where('createdBy', '==', userId).get();
        }
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SEARCH
app.get('/api/items/search', authenticate, async (req, res) => {
    try {
        const { keyword } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword diperlukan' });
        }
        
        const itemsRef = db.collection('items');
        let snapshot;
        
        if (userRole === 'admin') {
            snapshot = await itemsRef.get();
        } else {
            snapshot = await itemsRef.where('createdBy', '==', userId).get();
        }
        
        const items = [];
        const searchTerm = keyword.toLowerCase();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.name && data.name.toLowerCase().includes(searchTerm)) {
                items.push({ id: doc.id, ...data });
            }
        });
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Tambah data
app.post('/api/items', authenticate, async (req, res) => {
    try {
        const { name, stock, price } = req.body;
        const userId = req.user.userId;
        
        if (!name) {
            return res.status(400).json({ error: 'Nama barang wajib diisi' });
        }
        
        const data = {
            name,
            stock: stock || 0,
            price: price || 0,
            createdBy: userId,
            createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('items').add(data);
        const newItem = { id: docRef.id, ...data };
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Update data
app.put('/api/items/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stock, price } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        if (!name) {
            return res.status(400).json({ error: 'Nama barang wajib diisi' });
        }
        
        const docRef = db.collection('items').doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        
        const dataItem = doc.data();
        
        if (userRole !== 'admin' && dataItem.createdBy !== userId) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke data ini' });
        }
        
        const updateData = {
            name,
            stock: stock || 0,
            price: price || 0,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };
        
        await docRef.update(updateData);
        res.json({ id, ...updateData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Hapus data
app.delete('/api/items/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        const docRef = db.collection('items').doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        
        const dataItem = doc.data();
        
        if (userRole !== 'admin' && dataItem.createdBy !== userId) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke data ini' });
        }
        
        await docRef.delete();
        res.json({ message: 'Data berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EXPORT UNTUK VERCEL
// ============================================
module.exports = app;