const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  teacherid:{
    type:"String"
  },
  classname: {
    type: "String",
  },
  teachername: {
    type: "String",
  },
  coverimage: {
    type: "String",
  },
  classcode:{
    type: "String",
  }
});
module.exports = mongoose.model("add_classroom", userSchema);