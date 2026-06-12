const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const permissionSchema = new mongoose.Schema({
  manageUsers: { type: Boolean, default: false },
  managePets: { type: Boolean, default: false },
  manageLocations: { type: Boolean, default: false },
  viewReports: { type: Boolean, default: false },
  manageAdmins: { type: Boolean, default: false }
}, { _id: false });

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return validator.isEmail(v);
      },
      message: 'Email inválido'
    }
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['super_admin', 'admin', 'moderator'],
      message: 'Role inválida: {VALUE}'
    },
    default: 'admin'
  },
  permissions: {
    type: permissionSchema,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: transformAdmin },
  toObject: { virtuals: true }
});

function transformAdmin(doc, ret) {
  delete ret.password;
  delete ret.__v;
  delete ret.passwordResetToken;
  delete ret.passwordResetExpires;
  return ret;
}

adminSchema.virtual('isLocked').get(function() {
  if (!this.lockUntil) return false;
  return this.lockUntil > Date.now();
});

adminSchema.virtual('fullInfo').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastLogin: this.lastLogin
  };
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

adminSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(12);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 0;
    this.lockUntil = null;
  }
  
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  
  await this.save();
  return this;
};

adminSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save();
  return this;
};

adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  if (!this.permissions) return false;
  return this.permissions[permission] === true;
};

adminSchema.methods.hasAnyPermission = function(permissions) {
  if (this.role === 'super_admin') return true;
  return permissions.some(permission => this.hasPermission(permission));
};

adminSchema.methods.hasAllPermissions = function(permissions) {
  if (this.role === 'super_admin') return true;
  return permissions.every(permission => this.hasPermission(permission));
};

adminSchema.methods.updatePermissions = function(permissions) {
  const allowedPermissions = ['manageUsers', 'managePets', 'manageLocations', 'viewReports', 'manageAdmins'];
  
  for (const [key, value] of Object.entries(permissions)) {
    if (allowedPermissions.includes(key) && typeof value === 'boolean') {
      this.permissions[key] = value;
    }
  }
  
  return this;
};

adminSchema.methods.activate = function() {
  this.isActive = true;
  this.updatedAt = new Date();
  return this;
};

adminSchema.methods.deactivate = function() {
  this.isActive = false;
  this.updatedAt = new Date();
  return this;
};

adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this;
};

adminSchema.methods.canManageUser = function(userId) {
  if (this.role === 'super_admin') return true;
  if (this.role === 'admin') return this.hasPermission('manageUsers');
  return false;
};

adminSchema.methods.getAccessibleResources = function() {
  const resources = [];
  
  if (this.hasPermission('manageUsers')) resources.push('users');
  if (this.hasPermission('managePets')) resources.push('pets');
  if (this.hasPermission('manageLocations')) resources.push('locations');
  if (this.hasPermission('viewReports')) resources.push('reports');
  if (this.hasPermission('manageAdmins') && this.role === 'super_admin') {
    resources.push('admins');
  }
  
  return resources;
};

adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

adminSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

adminSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

adminSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
        superAdmins: { $sum: { $cond: [{ $eq: ['$role', 'super_admin'] }, 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        moderators: { $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { total: 0, active: 0, inactive: 0, superAdmins: 0, admins: 0, moderators: 0 };
};

adminSchema.statics.isEmailTaken = async function(email, excludeAdminId) {
  const query = { email: email.toLowerCase().trim() };
  if (excludeAdminId) {
    query._id = { $ne: excludeAdminId };
  }
  const admin = await this.findOne(query);
  return !!admin;
};

module.exports = mongoose.model('Admin', adminSchema);
