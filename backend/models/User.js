const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['admin', 'manager', 'technician', 'employee', 'asset_manager'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: 'employee' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    phone: { type: String, trim: true },
    avatar: { type: String },
    status: { type: String, enum: ['Pending', 'Active', 'Inactive', 'Suspended', 'Rejected'], default: 'Active' },
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
    // For technicians
    skills: [{ type: String }],
    maxTickets: { type: Number, default: 20 },
  },
  { timestamps: true }
);

// email is already indexed via unique:true above
userSchema.index({ organization: 1, role: 1 });
userSchema.index({ department: 1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Never expose password hash or refresh token
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
