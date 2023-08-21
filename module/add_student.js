const express = require('express');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fname: {
    type: "string",
  },

  lname: {
    type: "string",
  },

  eno: {
    type: "string",
  },

  sem: {
    type: "string",
  },

  branch: {
    type: "string",
  },

  mob: {
    type: "string",
  },

  photo: {
    type: "string",
  },
});

module.exports = mongoose.model("add_student", userSchema);