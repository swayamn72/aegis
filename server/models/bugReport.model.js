import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    stepsToReproduce: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['open', 'in progress', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

const BugReport = mongoose.model('BugReport', bugReportSchema);

export default BugReport;
