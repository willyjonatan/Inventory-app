const API_URL = '/api/items';
let items = [];

// DOM Elements
const nameInput = document.getElementById('nameInput');
const stockInput = document.getElementById('stockInput');
const priceInput = document.getElementById('priceInput');
const editId = document.getElementById('editId');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const dataBody = document.getElementById('dataBody');
const dataFoot = document.getElementById('dataFoot');
const loading = document.getElementById('loading');
const dataTable = document.getElementById('dataTable');
const totalItems = document.getElementById('totalItems');
const totalStock = document.getElementById('totalStock');
const totalValue = document.getElementById('totalValue');

function getToken() {
    return localStorage.getItem('token');
}

// ============================================
// FETCH DATA
// ============================================
async function fetchItems() {
    try {
        loading.style.display = 'block';
        dataTable.style.display = 'none';
        
        const token = getToken();
        if (!token) {
            alert('Token tidak ditemukan! Silakan login ulang.');
            window.location.href = 'login.html';
            return;
        }
        
        const res = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Sesi habis! Silakan login ulang.');
            window.location.href = 'login.html';
            return;
        }
        
        if (!res.ok) throw new Error('Gagal memuat data');
        
        items = await res.json();
        renderTable();
        updateStats();
        loading.style.display = 'none';
        dataTable.style.display = 'table';
    } catch (error) {
        console.error('Error fetching:', error);
        alert('Gagal memuat data: ' + error.message);
        loading.style.display = 'none';
    }
}

// ============================================
// UPDATE STATS
// ============================================
function updateStats() {
    const total = items.length;
    const stock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const value = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

    totalItems.textContent = total;
    totalStock.textContent = stock;
    totalValue.textContent = `Rp ${value.toLocaleString('id-ID')}`;
}

// ============================================
// RENDER TABLE
// ============================================
function renderTable() {
    if (items.length === 0) {
        dataBody.innerHTML = `<tr><td colspan="6" class="empty">Belum ada data barang</td></tr>`;
        dataFoot.innerHTML = '';
        return;
    }

    dataBody.innerHTML = items.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.stock || 0}</td>
            <td>Rp ${(item.price || 0).toLocaleString('id-ID')}</td>
            <td>Rp ${((item.stock || 0) * (item.price || 0)).toLocaleString('id-ID')}</td>
            <td>
                <button class="btn-edit" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
            </td>
        </tr>
    `).join('');

    const totalStockAll = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const totalValueAll = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

    dataFoot.innerHTML = `
        <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td>${totalStockAll}</td>
            <td></td>
            <td>Rp ${totalValueAll.toLocaleString('id-ID')}</td>
            <td></td>
        </tr>
    `;
}

// ============================================
// ADD ITEM
// ============================================
async function addItem() {
    const name = nameInput.value.trim();
    const stock = parseInt(stockInput.value) || 0;
    const price = parseInt(priceInput.value) || 0;

    if (!name) {
        alert('Nama barang wajib diisi!');
        nameInput.focus();
        return;
    }

    const token = getToken();
    if (!token) {
        alert('Token tidak ditemukan! Silakan login ulang.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, stock, price })
        });

        if (res.ok) {
            clearForm();
            await fetchItems();
            alert('Data berhasil ditambahkan!');
        } else if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Sesi habis! Silakan login ulang.');
            window.location.href = 'login.html';
        } else {
            const error = await res.json();
            alert(error.error || 'Gagal menambah data!');
        }
    } catch (error) {
        console.error('Error adding:', error);
        alert('Terjadi kesalahan!');
    }
}

// ============================================
// EDIT, UPDATE, DELETE
// ============================================
function editItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    nameInput.value = item.name;
    stockInput.value = item.stock || 0;
    priceInput.value = item.price || 0;
    editId.value = id;
    saveBtn.textContent = 'Update';
    cancelBtn.style.display = 'inline-block';
    formTitle.textContent = 'Edit Barang';
    nameInput.focus();
}

async function updateItem() {
    const id = editId.value;
    const name = nameInput.value.trim();
    const stock = parseInt(stockInput.value) || 0;
    const price = parseInt(priceInput.value) || 0;

    if (!name) {
        alert('Nama barang wajib diisi!');
        nameInput.focus();
        return;
    }

    const token = getToken();
    if (!token) {
        alert('Token tidak ditemukan! Silakan login ulang.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, stock, price })
        });

        if (res.ok) {
            clearForm();
            await fetchItems();
            alert('Data berhasil diupdate!');
        } else if (res.status === 403) {
            alert('Anda tidak memiliki akses ke data ini!');
        } else if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Sesi habis! Silakan login ulang.');
            window.location.href = 'login.html';
        } else {
            const error = await res.json();
            alert(error.error || 'Gagal update data!');
        }
    } catch (error) {
        console.error('Error updating:', error);
        alert('Terjadi kesalahan!');
    }
}

async function deleteItem(id) {
    if (!confirm('Yakin ingin menghapus barang ini?')) return;

    const token = getToken();
    if (!token) {
        alert('Token tidak ditemukan! Silakan login ulang.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            await fetchItems();
            alert('Data berhasil dihapus!');
        } else if (res.status === 403) {
            alert('Anda tidak memiliki akses ke data ini!');
        } else if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Sesi habis! Silakan login ulang.');
            window.location.href = 'login.html';
        } else {
            const error = await res.json();
            alert(error.error || 'Gagal menghapus data!');
        }
    } catch (error) {
        console.error('Error deleting:', error);
        alert('Terjadi kesalahan!');
    }
}

// ============================================
// CLEAR FORM
// ============================================
function clearForm() {
    nameInput.value = '';
    stockInput.value = '';
    priceInput.value = '';
    editId.value = '';
    saveBtn.textContent = 'Simpan';
    cancelBtn.style.display = 'none';
    formTitle.textContent = 'Tambah Barang';
}

function cancelEdit() {
    clearForm();
}

// ============================================
// SEARCH
// ============================================
function searchItems() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        fetchItems();
        return;
    }
    
    const token = getToken();
    if (!token) {
        alert('Token tidak ditemukan! Silakan login ulang.');
        window.location.href = 'login.html';
        return;
    }
    
    fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            items = data;
            renderTable();
            updateStats();
        })
        .catch(err => console.error('Search error:', err));
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    fetchItems();
}

// ============================================
// EVENT LISTENERS
// ============================================
saveBtn.addEventListener('click', () => {
    if (editId.value) {
        updateItem();
    } else {
        addItem();
    }
});

cancelBtn.addEventListener('click', cancelEdit);

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') stockInput.focus();
});

stockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') priceInput.focus();
});

priceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveBtn.click();
});

// ============================================
// LOAD DATA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (!token) {
        alert('Token tidak ditemukan! Silakan login ulang.');
        window.location.href = 'login.html';
        return;
    }
    fetchItems();
});