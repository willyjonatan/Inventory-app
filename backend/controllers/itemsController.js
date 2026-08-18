const { db } = require('../config/firebase');

const collection = db.collection('items');

// GET - Ambil semua data
exports.getAllItems = async (req, res) => {
    try {
        const snapshot = await collection.get();
        const items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET - Search items
exports.searchItems = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }
        
        const snapshot = await collection.get();
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
};

// POST - Tambah data baru
exports.createItem = async (req, res) => {
    try {
        const { name, stock, price } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nama barang wajib diisi' });
        }
        
        if (stock && stock < 0) {
            return res.status(400).json({ error: 'Stok tidak boleh negatif' });
        }
        
        if (price && price < 0) {
            return res.status(400).json({ error: 'Harga tidak boleh negatif' });
        }

        const data = {
            name,
            stock: stock || 0,
            price: price || 0,
            createdAt: new Date().toISOString(),
            createdBy: req.user ? req.user.email : 'system'
        };

        const docRef = await collection.add(data);
        const newItem = { id: docRef.id, ...data };
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT - Update data
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stock, price } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Nama barang wajib diisi' });
        }
        
        if (stock && stock < 0) {
            return res.status(400).json({ error: 'Stok tidak boleh negatif' });
        }
        
        if (price && price < 0) {
            return res.status(400).json({ error: 'Harga tidak boleh negatif' });
        }

        const data = {
            name,
            stock: stock || 0,
            price: price || 0,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user ? req.user.email : 'system'
        };

        await collection.doc(id).update(data);
        res.json({ id, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE - Hapus data
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await collection.doc(id).delete();
        res.json({ message: 'Data berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};