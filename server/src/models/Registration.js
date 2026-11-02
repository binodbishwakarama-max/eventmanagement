import { randomBytes } from 'node:crypto';
import { Schema, model } from 'mongoose';

const registrationSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered'
    },
    attended: {
      type: Boolean,
      default: false
    },
    attendedAt: {
      type: Date
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    cancelledAt: {
      type: Date
    },
    ticketCode: {
      type: String,
      default: () => `EVT-${randomBytes(8).toString('hex').toUpperCase()}`
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

// Unique compound index: one registration record per event per student
registrationSchema.index({ event: 1, student: 1 }, { unique: true });
registrationSchema.index({ ticketCode: 1 }, { unique: true });
registrationSchema.index({ student: 1, createdAt: -1 });
registrationSchema.index({ event: 1, status: 1, registeredAt: 1 });
registrationSchema.index({ event: 1, status: 1, attended: 1 });

export const Registration = model('Registration', registrationSchema);
