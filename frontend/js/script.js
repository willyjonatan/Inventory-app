const API_URL = 'http://localhost:3000/api/items';
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
const alertMessage = document.getElementById('alertMessage');

// Fetch semua data
async function fetchItems() {
    try {
        showLoading(true);
        const res = await fetch(API_URL);
        
        if (!res.ok) {
            throw new Error('Gagal memuat data');
        }
        
        items = await res.json();
        renderTable();
        updateStats();
        showLoading(false);
    } catch (error) {
        console.error('Error fetching:', error);
        showAlert('Gagal memuat data!', 'error');
        showLoading(false);
    }
}

// Update statistik
function updateStats() {
    const total = items.length;
    const stock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const value = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

    totalItems.textContent = total;
    totalStock.textContent = stock;
    totalValue.textContent = `Rp ${value.toLocaleString('id-ID')}`;
}

// Render tabel
function renderTable() {
    if (items.length === 0) {
        dataBody.innerHTML = `<tr><td colspan="6" class="empty">📭 Belum ada data barang</td></tr>`;
        dataFoot.innerHTML = '';
        dataTable.style.display = 'table';
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
                <button class="btn-edit" onclick="editItem('${item.id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">🗑️ Hapus</button>
            </td>
        </tr>
    `).join('');

    // Footer total
    const totalStockAll = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const totalValueAll = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

    dataFoot.innerHTML = `
        <tr class="total-row">
            <td colspan="2">📊 TOTAL</td>
            <td>${totalStockAll}</td>
            <td></td>
            <td>Rp ${totalValueAll.toLocaleString('id-ID')}</td>
            <td></td>
        </tr>
    `;

    dataTable.style.display = 'table';
}

// Tambah data
async function addItem() {
    const name = nameInput.value.trim();
    const stock = parseInt(stockInput.value) || 0;
    const price = parseInt(priceInput.value) || 0;

    if (!name) {
        showAlert('Nama barang wajib diisi!', 'error');
        nameInput.focus();
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, stock, price })
        });

        if (res.ok) {
            clearForm();
            await fetchItems();
            showAlert('Data berhasil ditambahkan!', 'success');
        } else {
            const error = await res.json();
            showAlert(error.error || 'Gagal menambah data!', 'error');
        }
    } catch (error) {
        console.error('Error adding:', error);
        showAlert('Terjadi kesalahan!', 'error');
    }
}

// Edit data
function editItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    nameInput.value = item.name;
    stockInput.value = item.stock || 0;
    priceInput.value = item.price || 0;
    editId.value = id;
    saveBtn.textContent = 'Update';
    cancelBtn.style.display = 'inline-block';
    formTitle.textContent = '✏️ Edit Barang';
    nameInput.focus();
}

// Update data
async function updateItem() {
    const id = editId.value;
    const name = nameInput.value.trim();
    const stock = parseInt(stockInput.value) || 0;
    const price = parseInt(priceInput.value) || 0;

    if (!name) {
        showAlert('Nama barang wajib diisi!', 'error');
        nameInput.focus();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, stock, price })
        });

        if (res.ok) {
            clearForm();
            await fetchItems();
            showAlert('Data berhasil diupdate!', 'success');
        } else {
            const error = await res.json();
            showAlert(error.error || 'Gagal update data!', 'error');
        }
    } catch (error) {
        console.error('Error updating:', error);
        showAlert('Terjadi kesalahan!', 'error');
    }
}

// Hapus data
async function deleteItem(id) {
    if (!confirm('Yakin ingin menghapus barang ini?')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            await fetchItems();
            showAlert('Data berhasil dihapus!', 'success');
        } else {
            const error = await res.json();
            showAlert(error.error || 'Gagal menghapus data!', 'error');
        }
    } catch (error) {
        console.error('Error deleting:', error);
        showAlert('Terjadi kesalahan!', 'error');
    }
}

// Clear form
function clearForm() {
    nameInput.value = '';
    stockInput.value = '';
    priceInput.value = '';
    editId.value = '';
    saveBtn.textContent = 'Simpan';
    cancelBtn.style.display = 'none';
    formTitle.textContent = '➕ Tambah Barang';
    hideAlert();
}

// Cancel edit
function cancelEdit() {
    clearForm();
}

// Show/hide loading
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    dataTable.style.display = show ? 'none' : 'table';
}

// Show alert
function showAlert(message, type = 'success') {
    alertMessage.textContent = message;
    alertMessage.className = `alert ${type}`;
    alertMessage.style.display = 'block';
    
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    alertMessage.style.display = 'none';
}

// Event listeners
saveBtn.addEventListener('click', () => {
    if (editId.value) {
        updateItem();
    } else {
        addItem();
    }
});

cancelBtn.addEventListener('click', cancelEdit);

// Enter key support
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        stockInput.focus();
    }
});

stockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        priceInput.focus();
    }
});

priceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveBtn.click();
    }
});

// Load data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
});