const express = require('express');
const router = express.Router();
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const auth = require('../middlewares/auth.middleware');

// Get all posts with pagination, sorting and filtering
router.get('/posts', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      category,
      search,
      tag
    } = req.query;
    
    const lang = req.query.lang || 'en';
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Apply filters
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query['title.' + lang] = { $regex: search, $options: 'i' };
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    // Handle sticky posts separately
    const stickyPosts = await Post.find({ 
      ...query, 
      isSticky: true,
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('author', 'name profileImage')
    .lean();
    
    // Get regular posts
    const regularPosts = await Post.find({ 
      ...query, 
      isSticky: false,
      status: 'published'
    })
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('author', 'name profileImage')
    .lean();
    
    // Get total count for pagination
    const total = await Post.countDocuments({ ...query, isSticky: false, status: 'published' });
    
    // Format posts based on language preference
    const formatPosts = (posts) => posts.map(post => ({
      ...post,
      title: post.title[lang] || post.title.en,
      content: post.content[lang] || post.content.en
    }));
    
    res.status(200).json({
      success: true,
      data: {
        stickyPosts: formatPosts(stickyPosts),
        posts: formatPosts(regularPosts),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single post with comments
router.get('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const lang = req.query.lang || 'en';
    
    // Increment view count
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
    
    const post = await Post.findById(postId)
      .populate('author', 'name profileImage')
      .populate({
        path: 'comments',
        match: { parentComment: null }, // Only top-level comments
        populate: [
          {
            path: 'author', 
            select: 'name profileImage'
          },
          {
            path: 'replies',
            populate: {
              path: 'author',
              select: 'name profileImage'
            }
          }
        ]
      })
      .lean();
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Format post for language
    const formattedPost = {
      ...post,
      title: post.title[lang] || post.title.en,
      content: post.content[lang] || post.content.en,
      comments: post.comments ? post.comments.map(comment => ({
        ...comment,
        content: comment.content[lang] || comment.content.en,
        replies: comment.replies ? comment.replies.map(reply => ({
          ...reply,
          content: reply.content[lang] || reply.content.en
        })) : []
      })) : []
    };
    
    res.status(200).json({
      success: true,
      data: formattedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create a new post
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category, tags, isSticky, isAnnouncement, status } = req.body;
    
    // Create post
    const newPost = new Post({
      title,
      content,
      category,
      tags,
      author: req.user._id,
      isSticky: isSticky || false,
      isAnnouncement: isAnnouncement || false,
      status: status || 'published'
    });
    
    await newPost.save();
    
    res.status(201).json({
      success: true,
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update a post
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, category, tags, isSticky, isAnnouncement, status } = req.body;
    
    // Check if post exists and user is author
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }
    
    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        content,
        category,
        tags,
        isSticky: isSticky || false,
        isAnnouncement: isAnnouncement || false,
        status: status || 'published'
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a post
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Check if post exists
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    // Delete all comments associated with the post
    await Comment.deleteMany({ post: postId });
    
    // Delete post
    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add a comment to a post
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, parentComment } = req.body;
    
    // Check if post exists
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Create new comment
    const newComment = new Comment({
      content,
      post: postId,
      author: req.user._id,
      parentComment: parentComment || null
    });
    
    await newComment.save();
    
    // Populate author
    await newComment.populate('author', 'name profileImage');
    
    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update a comment
router.put('/comments/:id', auth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }
    
    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
        isEdited: true
      },
      { new: true }
    ).populate('author', 'name profileImage');
    
    res.status(200).json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const commentId = req.params.id;
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    // Delete all reply comments
    await Comment.deleteMany({ parentComment: commentId });
    
    // Delete comment
    await Comment.findByIdAndDelete(commentId);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Like/Unlike a post
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    
    // Check if post exists
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user has already liked the post
    const alreadyLiked = post.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the post
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Post unliked successfully'
      });
    } else {
      // Like the post
      await Post.findByIdAndUpdate(
        postId,
        { $push: { likes: userId } },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Post liked successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Like/Unlike a comment
router.post('/comments/:id/like', auth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user has already liked the comment
    const alreadyLiked = comment.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the comment
      await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: userId } },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Comment unliked successfully'
      });
    } else {
      // Like the comment
      await Comment.findByIdAndUpdate(
        commentId,
        { $push: { likes: userId } },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Comment liked successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get forum categories
router.get('/categories', async (req, res) => {
  try {
    // This could be dynamic from the database in the future
    const categories = [
      { id: 'general', nameKey: 'forum.categories.general' },
      { id: 'organic_farming', nameKey: 'forum.categories.organicFarming' },
      { id: 'cow_care', nameKey: 'forum.categories.cowCare' },
      { id: 'product_info', nameKey: 'forum.categories.productInfo' },
      { id: 'market_trends', nameKey: 'forum.categories.marketTrends' },
      { id: 'biodiversity', nameKey: 'forum.categories.biodiversity' },
      { id: 'technical', nameKey: 'forum.categories.technical' }
    ];
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;