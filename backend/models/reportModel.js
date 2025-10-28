const mongoose = require("mongoose");

// This is the blueprint for a missing person report
const reportSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // This creates the connection to the User model
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    latitude: {
  type: Number,
  required: false, // Make it optional for now
},
longitude: {
  type: Number,
  required: false,
},
    contactInfo: {
  type: String,
  required: [true, 'Please provide a contact phone number or email'],
},
likes: {
  type: [mongoose.Schema.Types.ObjectId], // Defines an array of User IDs
  ref: 'User',
  default: [], // Defaults to an empty array
},
    age: {
      type: Number,
      required: [true, "Please add an age"],
    },
    lastSeen: {
      type: String,
      required: [true, "Please add a last seen location"],
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
  
  enum: ['pending', 'approved', 'rejected', 'found'],
  default: 'pending',
},
region: {
  type: String,
  required: [true, 'Please specify the region'],
},
    // Mongoose automatically adds a createdAt and updatedAt timestamp
  },
  {
    timestamps: true,
  }
);

// We export a "Model" based on the schema, which we use to interact with the 'reports' collection
module.exports = mongoose.model("Report", reportSchema);
