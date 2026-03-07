const express = require('express');
const router = express.Router();
const { 
    getQuestions, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion, 
    createQuestions, 
    getCategories,
    getTopicsByCategory,
    deleteAllQuestions 
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', protect, getCategories);
router.get('/:category/topics', protect, getTopicsByCategory);
router.delete('/deleteAll', protect, admin, deleteAllQuestions);

router.route('/bulk').post(protect, admin, createQuestions);

router.route('/')
    .get(protect, getQuestions)
    .post(protect, admin, addQuestion);

router.route('/:id')
    .put(protect, admin, updateQuestion)
    .delete(protect, admin, deleteQuestion);

module.exports = router;
