const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name:{
        type:"String",
    },
    classcode:{
        type:"String",
    }
});
module.exports = mongoose.model("add_result",userSchema);