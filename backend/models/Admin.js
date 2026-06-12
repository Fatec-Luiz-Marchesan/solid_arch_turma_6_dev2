const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    managePets: { type: Boolean, default: false },
    manageLocations: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

adminSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

adminSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions[permission] === true;
};

adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

adminSchema.statics.getActiveAdmins = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('Admin', adminSchema);
