const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  tid: {
    type: Number,
    unique: true,
  },
  tname: {
    type: String,
  },
  tmob: {
    type: String,
  },
  tsalary: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  const latestTeacher = await this.constructor.findOne(
    {},
    { tid: 1 },
    { sort: { tid: -1 } }
  );
  if (latestTeacher) {
    this.tid = latestTeacher.tid + 1;
  } else {
    this.tid = 1;
  }
  next();
});

const AddTeacher = mongoose.model("add_teacher", userSchema);

module.exports = AddTeacher;
