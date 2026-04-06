const { nanoid } = require('nanoid');
const Prompt = require('../models/Prompt');

// GET /prompts
const getPrompts = async (req, res) => {
  try {
    const { category, favorite, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };

    if (category && category !== 'all') filter.category = category;
    if (favorite === 'true') filter.isFavorite = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [prompts, total] = await Promise.all([
      Prompt.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Prompt.countDocuments(filter),
    ]);

    res.json({ prompts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /prompts/search?q=...
const searchPrompts = async (req, res) => {
  try {
    const { q, category } = req.query;
    if (!q) return res.json({ prompts: [] });

    const filter = {
      userId: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ],
    };
    if (category && category !== 'all') filter.category = category;

    const prompts = await Prompt.find(filter).sort({ updatedAt: -1 }).limit(50);
    res.json({ prompts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /prompts/share/:shareId (public)
const getPublicPrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      shareId: req.params.shareId,
      isPublic: true,
    }).populate('userId', 'name avatar');
    if (!prompt) return res.status(404).json({ error: 'Prompt not found or not public' });
    res.json({ prompt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /prompts/export
const exportPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find({ userId: req.user._id }).lean();
    res.setHeader('Content-Disposition', 'attachment; filename="promptvault-export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ exportedAt: new Date(), prompts }, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /prompts/import
const importPrompts = async (req, res) => {
  try {
    const { prompts } = req.body;
    if (!Array.isArray(prompts)) return res.status(400).json({ error: 'Invalid format' });

    const toInsert = prompts.map((p) => ({
      userId: req.user._id,
      title: p.title || 'Imported Prompt',
      description: p.description || '',
      content: p.content || '',
      tags: Array.isArray(p.tags) ? p.tags : [],
      category: p.category || 'other',
      isFavorite: false,
    }));

    const inserted = await Prompt.insertMany(toInsert);
    res.json({ imported: inserted.length, prompts: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /prompts/:id/history
const getVersionHistory = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('+versionHistory');
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json({ history: prompt.versionHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /prompts
const createPrompt = async (req, res) => {
  try {
    const { title, description, content, tags, category } = req.body;
    const prompt = await Prompt.create({
      userId: req.user._id,
      title,
      description,
      content,
      tags: tags || [],
      category: category || 'other',
    });
    res.status(201).json({ prompt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /prompts/:id
const updatePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id })
      .select('+versionHistory');
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });

    // Save current version to history before updating
    prompt.versionHistory.push({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      tags: prompt.tags,
      category: prompt.category,
    });
    // Keep only last 10 versions
    if (prompt.versionHistory.length > 10) {
      prompt.versionHistory = prompt.versionHistory.slice(-10);
    }

    const { title, description, content, tags, category, isFavorite, isPublic } = req.body;
    if (title !== undefined) prompt.title = title;
    if (description !== undefined) prompt.description = description;
    if (content !== undefined) prompt.content = content;
    if (tags !== undefined) prompt.tags = tags;
    if (category !== undefined) prompt.category = category;
    if (isFavorite !== undefined) prompt.isFavorite = isFavorite;
    if (isPublic !== undefined) {
      prompt.isPublic = isPublic;
      if (isPublic && !prompt.shareId) {
        prompt.shareId = nanoid(10);
      }
    }

    await prompt.save();
    const result = prompt.toObject();
    delete result.versionHistory;
    res.json({ prompt: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /prompts/:id
const deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json({ message: 'Prompt deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /prompts/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    prompt.isFavorite = !prompt.isFavorite;
    await prompt.save();
    res.json({ isFavorite: prompt.isFavorite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /prompts/:id/use
const incrementUsage = async (req, res) => {
  try {
    await Prompt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $inc: { usageCount: 1 } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPrompts,
  searchPrompts,
  getPublicPrompt,
  exportPrompts,
  importPrompts,
  getVersionHistory,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleFavorite,
  incrementUsage,
};
