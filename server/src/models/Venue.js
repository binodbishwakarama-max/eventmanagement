import { Schema, model } from 'mongoose';

const venueSchema = new Schema(
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
    campus: {
      type: String,
      enum: ['Harohalli Main Campus', 'City Innovation Campus (Kudlu Gate)', 'Other'],
      default: 'Harohalli Main Campus'
    },
    building: {
      type: String,
      default: ''
    },
    floor: {
      type: String,
      default: ''
    },
    venueType: {
      type: String,
      enum: [
        'Sports Ground',
        'Court',
        'Hall',
        'Amphitheater',
        'Library',
        'Laboratory',
        'Smart Classroom',
        'Gym',
        'Auditorium',
        'Seminar Hall',
        'Other'
      ],
      default: 'Other'
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      default: ''
    },
    amenities: {
      type: [String],
      default: []
    },
    accessibilityInformation: {
      type: String,
      default: 'Standard campus access'
    },
    bookingRules: {
      type: String,
      default: 'Requires faculty coordinator approval and venue availability check.'
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'maintenance', 'reserved'],
      default: 'available'
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'rejected', 'archived'],
      default: 'unverified'
    },
    sourceUrl: {
      type: String,
      default: 'https://www.dsu.edu.in/'
    },
    dateRetrieved: {
      type: Date,
      default: Date.now
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
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

venueSchema.index({ campus: 1, verificationStatus: 1, availabilityStatus: 1 });

export const Venue = model('Venue', venueSchema);

