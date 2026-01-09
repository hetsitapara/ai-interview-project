const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getQuestions)
    .post(protect, admin, addQuestion);

router.route('/:id')
    .put(protect, admin, updateQuestion)
    .delete(protect, admin, deleteQuestion);

module.exports = router;
