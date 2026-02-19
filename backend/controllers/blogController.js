const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Private
const getBlogs = async (req, res) => {
  try {
    const { tag, search } = req.query;
    let query = {};

    if (tag && tag !== 'All') {
      if (tag.includes(',')) {
        const tags = tag.split(',').map(t => t.trim());
        query.tag = { $in: tags };
      } else {
        query.tag = tag;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  const { title, content, tag } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    const blog = await Blog.create({
      user: req.user.id,
      title,
      content,
      // Use user's name from token/database. Assuming req.user is populated by middleware
      author: req.user.name || 'Anonymous',
      tag: tag || 'General' // Add tag support if schema allows, otherwise just ignore or add to schema
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the blog user OR is admin
    // assuming req.user.isAdmin is available (from your auth middleware)
    if (blog.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Blog.deleteOne({ _id: blog._id });
    res.json({ message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBlogs,
  createBlog,
  deleteBlog,
};
