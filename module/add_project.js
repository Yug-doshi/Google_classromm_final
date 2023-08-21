const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  classcode: {
    type: "string",
  },
  teachername: {
    type: "string",
  },
  teacherid: {
    type: "string",
  },
  result: {
    type: "string",
  },
  studentname: {
    type: "string",
  },
  studenteno:{
    type:"string"
  }
});
module.exports = mongoose.model("add_project",userSchema);