import SupportRequest from '../models/supportRequest.model.js';
import BugReport from '../models/bugReport.model.js';

// Create a new support request
export const createSupportRequest = async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    const userId = req.user.id; // Assuming user is authenticated and user info is in req.user

    if (!subject || !category || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const supportRequest = new SupportRequest({
      userId,
      subject,
      category,
      message,
    });

    await supportRequest.save();

    res.status(201).json({ message: 'Support request submitted successfully' });
  } catch (error) {
    console.error('Error creating support request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new bug report
export const createBugReport = async (req, res) => {
  try {
    const { title, stepsToReproduce, priority } = req.body;
    const userId = req.user.id; 

    if (!title || !stepsToReproduce) {
      return res.status(400).json({ message: 'Title and steps to reproduce are required' });
    }

    const bugReport = new BugReport({
      userId,
      title,
      stepsToReproduce,
      priority: priority || 'Low',
    });

    await bugReport.save();

    res.status(201).json({ message: 'Bug report submitted successfully' });
  } catch (error) {
    console.error('Error creating bug report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all bug reports with pagination and filtering
export const getAllBugReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, userId } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (userId) filter.userId = userId;

    const bugReports = await BugReport.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BugReport.countDocuments(filter);

    res.json({
      bugReports,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: bugReports.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update bug report status
export const updateBugReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in progress', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const bugReport = await BugReport.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!bugReport) {
      return res.status(404).json({ message: 'Bug report not found' });
    }

    res.json({ message: 'Bug report status updated', bugReport });
  } catch (error) {
    console.error('Error updating bug report status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
