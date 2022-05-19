'use strict';
// Import mongoose
    const mongoose = require("mongoose");

// Declare schema and assign Schema class
    const Schema = mongoose.Schema;

// Create Schema Instance and add schema propertise
    const User = new Schema({
        name: {
            type:String,
            required:true
        },
        last_name: {
            type:String,
            required:true
        },
        email: {
            type:String,
            required:true
        },
        points: {
            type:String,
            required:false,
            default : "0"
        },
        pwd:{
            type:String,
            required:true
        },
        isAdmin:{
            type:Boolean,
            required:false,
            default : false
        }
    });

// create and export model
module.exports = mongoose.model("userModel", User);

