import { Schema, model } from 'mongoose';

const clubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Other'],
      default: 'Technical'
    },
    campus: {
      type: String,
      enum: ['Harohalli Main Campus', 'Other'],
      default: 'Harohalli Main Campus'
    },
    description: {
      type: String,
      default: ''
    },
    facultyAdvisorName: {
      type: String,
      default: 'To be assigned'
    },
    facultyAdvisor: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    studentCoordinatorName: {
      type: String,
      default: 'To be assigned'
    },
    studentCoordinator: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    membershipStatus: {
      type: String,
      enum: ['open', 'closed', 'invite-only'],
      default: 'open'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    officialContactEmail: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'rejected', 'archived'],
      default: 'unverified'
    },
    sourceUrl: {
      type: String,
      default: 'https://www.dsu.edu.in/engineering/club-activities'
    },
    dateRetrieved: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

clubSchema.index({ campus: 1, verificationStatus: 1, isActive: 1 });

export const Club = model('Club', clubSchema);

