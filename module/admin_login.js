const express = require('express');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type: 'string'
    },

    password: {
        type: 'string'
    }
});

module.exports = mongoose.model("admin_login",userSchema);