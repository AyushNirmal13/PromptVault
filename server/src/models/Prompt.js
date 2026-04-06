const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    content: String,
    tags: [String],
    category: String,
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const promptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Prompt content is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'other',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    versionHistory: {
      type: [versionSchema],
      default: [],
      select: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for full-text search
promptSchema.index({ title: 'text', tags: 'text', description: 'text' });

module.exports = mongoose.model('Prompt', promptSchema);
