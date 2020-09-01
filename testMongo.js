// Just learning some mongoose

const mongoose = require('mongoose');
const express = require('express');

mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const employeeSchema = new mongoose.Schema({
  name: String,
  age: Number
});

const Manager = mongoose.model("Manager", employeeSchema);

const tim = new Manager ({
  name: 'Tim',
  age: 32
});

console.log(tim);

tim.save();

const james = {
  name: 'James',
  age: 34
}


mongoose.connection.close();
