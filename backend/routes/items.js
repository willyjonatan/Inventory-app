const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');
const { authenticate } = require('../middleware/auth');

// Public routes (bisa diakses tanpa login)
router.get('/', itemsController.getAllItems);
router.get('/search', itemsController.searchItems);

// Protected routes (harus login)
router.post('/', authenticate, itemsController.createItem);
router.put('/:id', authenticate, itemsController.updateItem);
router.delete('/:id', authenticate, itemsController.deleteItem);

module.exports = router;