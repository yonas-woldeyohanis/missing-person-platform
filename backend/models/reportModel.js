const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
    },

    // --- SAFE UPDATE: GENDER ---
    // We make this optional so the Web App (which has no gender input yet)
    // can still post reports successfully.
    gender: {
      type: String,
      enum: ["Male", "Female", "Unknown"],
      default: "Unknown", // If Web App posts, it saves as "Unknown"
      required: false,
    },

    age: {
      type: Number,
      required: [true, "Please add an age"],
    },

    // --- SAFE UPDATE: LOCATION ---
    lastSeen: {
      type: String,
      required: [true, "Please add a last seen location"],
    },
    lastSeenDate: {
      type: String,
      required: false,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },

    // --- SAFE UPDATE: REGION ---
    // Web App sends it, Mobile App doesn't.
    // Making it false allows both to work.
    region: {
      type: String,
      required: false,
      default: "Ethiopia", // Default for Mobile App posts
    },

    // --- CONTACT ---
    // Accepts "yonas@gmail.com" (Web) OR "+251911..." (Mobile)
    contactInfo: {
      type: String,
      required: [true, "Please provide contact info"],
    },

    photoUrl: {
      type: String,
      required: [true, "Please add a photo URL"],
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "found"],
      default: "pending",
    },

    // --- METRICS ---
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.expo;
