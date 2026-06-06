const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Personal', 'Study', 'Work', 'Fitness', 'Finance', 'Other'],
      default: 'Other',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date'],
    },
    dueTime: {
      type: String, // HH:mm format
      default: '',
    },

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
