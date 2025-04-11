
// Get all items with filtering
exports.getItems = async (req, res) => {
  try {
    const { type, category, status, search } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    
    // By default, only return pending items (not claimed, resolved or rejected)
    if (!status) {
      query.status = 'pending';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Query:', query);
    
    const items = await Item.find(query)
      .populate('user', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });
      
    console.log(`Found ${items.length} items`);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
