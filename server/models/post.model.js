const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: Map,
    of: String,
    required: true
    // Structure: { en: "Post title in English", hi: "पोस्ट शीर्षक हिंदी में" }
  },
  content: {
    type: Map,
    of: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'organic_farming', 'cow_care', 'product_info', 'market_trends', 'biodiversity', 'technical']
  },
  tags: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  isSticky: {
    type: Boolean,
    default: false
  },
  isAnnouncement: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;