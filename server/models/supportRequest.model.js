import mongoose from 'mongoose';

const supportRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Account Issues', 'Technical Problems', 'Billing & Payments', 'Feature Requests', 'Other'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
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

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

export default SupportRequest;
