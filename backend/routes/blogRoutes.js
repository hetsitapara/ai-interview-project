const express = require('express');
const router = express.Router();
const { getBlogs, createBlog, deleteBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getBlogs) // Assuming you want it protected, or remove 'protect' if public
    .post(protect, createBlog);

router.route('/:id')
    .delete(protect, deleteBlog);

module.exports = router;
