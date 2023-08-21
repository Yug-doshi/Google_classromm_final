const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  classcode: {
    type: "string",
  },
  eno: {
    type: "string",
  },
  name:{
    type: "string",
  }
});
module.exports = mongoose.model("classroom_students",userSchema);