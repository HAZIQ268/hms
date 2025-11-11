// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ===== Utility for auto user code =====
let counter = 0;
async function generateUserCode() {
  counter++;
  return `LS-USER-${counter.toString().padStart(4, '0')}`;
}

const userSchema = new mongoose.Schema(
  {
    userCode: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    contact: { type: String, trim: true },
    role: {
      type: String,
      enum: ['admin', 'manager', 'receptionist', 'housekeeping', 'user'],
      required: true,
      default: 'user',
    },
    image: { type: String, default: '' },
    preferences: { type: Object, default: {} },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// ===== Generate user code automatically =====
userSchema.pre('save', async function (next) {
  if (!this.userCode) {
    this.userCode = await generateUserCode();
  }

  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ===== Password compare =====
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ===== Hide password in responses =====
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);



// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   role: { 
//     type: String, 
//     enum: ['admin','manager','receptionist','housekeeping','user'], 
//     required: true 
//   },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   contact: { type: String },
//   image: { type: String, default: '' },
//   preferences: { type: Object, default: {} },
//   status: { type: String, enum: ['active','inactive'], default: 'active' }
// }, { timestamps: true });


// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password') || !this.password) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });


// userSchema.methods.comparePassword = function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);

