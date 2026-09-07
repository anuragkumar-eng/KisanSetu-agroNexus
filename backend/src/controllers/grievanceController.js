const Grievance = require('../models/Grievance');
const Order = require('../models/Order');

// @desc    Submit a new grievance or support request
// @route   POST /api/grievances
// @access  Private
const createGrievance = async (req, res) => {
  try {
    const { category, subject, subjectHi, description, relatedOrderId, relatedOfferId } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, message: 'category, subject, and description are required' });
    }

    // Verify order ownership if an order is referenced
    if (relatedOrderId) {
      const order = await Order.findById(relatedOrderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Related order not found' });
      }

      const isFarmer = order.farmer.toString() === req.user._id.toString();
      const isBuyer = order.buyer.toString() === req.user._id.toString();

      if (!isFarmer && !isBuyer) {
        return res.status(403).json({ success: false, message: 'Not authorized to submit a grievance for this order' });
      }
    }

    const grievance = await Grievance.create({
      user: req.user._id, // Enforce authenticated user
      category,
      subject,
      subjectHi,
      description,
      relatedOrderId: relatedOrderId || undefined,
      relatedOfferId: relatedOfferId || undefined,
      status: 'open'
    });

    res.status(201).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all grievances submitted by the authenticated user
// @route   GET /api/grievances
// @access  Private
const getGrievances = async (req, res) => {
  try {
    const { status, limit } = req.query;

    const query = {};

    if (req.user.role === 'admin') {
      // Admins see all
    } else {
      query.user = req.user._id;
    }

    if (status) query.status = status;

    const pageSize = parseInt(limit, 10) || 20;

    const grievances = await Grievance.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize);

    res.json({
      success: true,
      data: grievances
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single grievance by ID
// @route   GET /api/grievances/:id
// @access  Private
const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('relatedOrderId', 'trackingId status cropName totalAmount');

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    // Authorization
    const isOwner = grievance.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this grievance' });
    }

    res.json({
      success: true,
      data: grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGrievance,
  getGrievances,
  getGrievanceById
};
