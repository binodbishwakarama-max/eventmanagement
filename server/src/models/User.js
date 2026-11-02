import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'organizer', 'admin'],
      default: 'student'
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    rollNumber: {
      type: String,
      trim: true,
      default: ''
    },
    usn: {
      type: String,
      trim: true,
      default: ''
    },
    clubName: {
      type: String,
      trim: true,
      default: ''
    },
    // Priority 3: University Identity Verification Fields
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    idCardDocumentUrl: {
      type: String,
      default: ''
    },
    // Priority 4: Session Revocation & Security Invalidation
    tokenVersion: {
      type: Number,
      default: 1
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ verificationStatus: 1, role: 1 });
userSchema.index({ passwordResetToken: 1 });

export const User = model('User', userSchema);
