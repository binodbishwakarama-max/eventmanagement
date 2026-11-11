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
      trim: true,
      index: true
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    authProvider: {
      type: String,
      enum: ['google', 'local'],
      default: 'local'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: ''
    },
    passwordHash: {
      type: String,
      required: false
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'organizer', 'admin', 'super_admin'],
      default: 'student'
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active',
      index: true
    },
    lastLoginAt: {
      type: Date
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
