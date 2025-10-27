import mongoose from 'mongoose';

const recruitmentApproachSchema = new mongoose.Schema(
    {
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        message: { type: String, trim: true, maxlength: 500 },
        tryoutChatId: { type: mongoose.Schema.Types.ObjectId, ref: 'TryoutChat', default: null },
        rejectionReason: { type: String, trim: true },
    },
    { timestamps: true }
);

// Indexes
recruitmentApproachSchema.index({ team: 1, status: 1 });
recruitmentApproachSchema.index({ player: 1, status: 1 });
recruitmentApproachSchema.index({ team: 1, player: 1 }, { unique: true });

const RecruitmentApproach = mongoose.model('RecruitmentApproach', recruitmentApproachSchema);

export default RecruitmentApproach;
