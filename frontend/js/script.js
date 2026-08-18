const API_URL = 'http://localhost:3000/api/items';
let items = [];
let searchKeyword = '';

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
const searchInput = document.getElementById('searchInput');

// Get token
function getToken() {
    return localStorage.getItem('token');
}

// Fetch all data
async function fetchItems() {
    try {
        showLoading(true);
        const url = searchKeyword ? `${API_URL}/search?keyword=${encodeURIComponent(searchKeyword)}` : API_URL;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        items = await response.json();
        renderTable();
        updateStats();
        showLoading(false);
    } catch (error) {
        console.error('Error fetching:', error);
        showAlert('Failed to load data!', 'error');
        showLoading(false);
    }
}

// Search items
function searchItems() {
    searchKeyword = searchInput.value.trim();
    fetchItems();
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    searchKeyword = '';
    fetchItems();
}

// Update stats
function updateStats() {
    const total = items.length;
    const stock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const value = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

    totalItems.textContent = total;
    totalStock.textContent = stock;
    totalValue.textContent = `Rp ${value.toLocaleString('id-ID')}`;
}

// Render table
function renderTable() {
    if (items.length === 0) {
        dataBody.innerHTML = `<tr><td colspan="6" class="empty">No items found</td></tr>`;
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
                <button class="btn-edit" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
            </td>
        </tr>
    `).join('');

    // Footer
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

    dataTable.style.display = 'table';
}

// Add item
async function addItem() {
    const name = nameInput.value.trim();
    const stock = parseInt(stockInput.value) || 0;
    const price = parseInt(priceInput.value) || 0;

    if (!name) {
        showAlert('Product name is required!', 'error');
        nameInput.focus();
        return;
    }

    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, stock, price })
        });

        if (response.ok) {
            clearForm();
            await fetchItems();
            showAlert('Item added successfully!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.error || 'Failed to add item!', 'error');
        }
    } catch (error) {
        console.error('Error adding:', error);
        showAlert('An error occurred!', 'error');
    }
}

// Edit item
function editItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    nameInput.value = item.name;
    stockInput.value = item.stock || 0;
    priceInput.value = item.price || 0;
    editId.value = id;
    saveBtn.textContent = 'Update';
    cancelBtn.style.display = 'inline-block';
    formTitle.textContent = 'Edit Item';
    nameInput.focus();
}

// Update item
async function updateItem() {
    const id = editId.value;
    const name = nameInput.value.trim();
    const stock = parseInt(stockInput.value) || 0;
    const price = parseInt(priceInput.value) || 0;

    if (!name) {
        showAlert('Product name is required!', 'error');
        nameInput.focus();
        return;
    }

    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, stock, price })
        });

        if (response.ok) {
            clearForm();
            await fetchItems();
            showAlert('Item updated successfully!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.error || 'Failed to update item!', 'error');
        }
    } catch (error) {
        console.error('Error updating:', error);
        showAlert('An error occurred!', 'error');
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await fetchItems();
            showAlert('Item deleted successfully!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.error || 'Failed to delete item!', 'error');
        }
    } catch (error) {
        console.error('Error deleting:', error);
        showAlert('An error occurred!', 'error');
    }
}

// Clear form
function clearForm() {
    nameInput.value = '';
    stockInput.value = '';
    priceInput.value = '';
    editId.value = '';
    saveBtn.textContent = 'Save';
    cancelBtn.style.display = 'none';
    formTitle.textContent = 'Add New Item';
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
    const alertEl = document.getElementById('alertMessage');
    if (alertEl) {
        alertEl.textContent = message;
        alertEl.className = `alert ${type}`;
        alertEl.style.display = 'block';
        
        setTimeout(() => {
            alertEl.style.display = 'none';
        }, 5000);
    }
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
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchItems();
    }
});

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

// Load data
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
    
    fetchItems();
});