const mongoose = require('mongoose');

const connectDB = async () => {
  try {
      await mongoose.connect("mongodb+srv://nguyenleminhnhat185:cgIFGG9wiCb1gjBk@cluster0.dokhsm9.mongodb.net/todolist?retryWrites=true&w=majority&appName=Cluster0")
      console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = connectDB;