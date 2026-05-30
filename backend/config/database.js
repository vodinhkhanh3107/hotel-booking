const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports.connect = async () => {
    try{
        mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to database successfully");
    }

    catch(error) {
        throw new Error("Error connecting to database: " + error.message);
    }
}
