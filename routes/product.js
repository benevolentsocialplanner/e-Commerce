const express = require('express');
const {allProducts, detailProducts, createProduct, deleteProduct, updateProduct, createReview,adminProducts} = require('../controllers/product.js');
const {authenticationMid, roleCheck} = require('../middleware/auth.js')
const router = express.Router()

router.get('/products', allProducts)
router.get('/admin/products', authenticationMid, roleCheck('admin'), adminProducts)
router.get('/products/:id', detailProducts)
router.post('/product/new', authenticationMid, roleCheck('admin'), createProduct)
router.post('/product/newReview', authenticationMid, createReview)
router.put('/products/:id', authenticationMid, roleCheck('admin'), updateProduct)
router.delete('/product/new', authenticationMid, roleCheck('admin'), deleteProduct)

module.exports = router;