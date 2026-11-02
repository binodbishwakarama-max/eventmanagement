import { Schema, model } from 'mongoose';

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },
    category: {
      type: String,
      required: true,
      enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other']
    },
    venue: {
      type: String,
      required: true,
      trim: true
    },
    startsAt: {
      type: Date,
      required: true
    },
    endsAt: {
      type: Date,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 10000
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizerClub: {
      type: String,
      default: 'Organizer not specified'
    },
    posterUrl: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

eventSchema.virtual('phase').get(function () {
  const now = new Date();
  if (now < this.startsAt) return 'upcoming';
  if (now > this.endsAt) return 'completed';
  return 'ongoing';
});

eventSchema.index({ startsAt: 1, status: 1 });
eventSchema.index({ status: 1, startsAt: 1 });
eventSchema.index({ status: 1, endsAt: 1 });
eventSchema.index({ status: 1, category: 1, startsAt: 1 });
eventSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
eventSchema.index({ title: 'text', description: 'text', venue: 'text' });

export const Event = model('Event', eventSchema);
