const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/Loginhack");

// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
    .catch(() => {
        console.log("Database cannot be Connected");
    })

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const Eventschema = new mongoose.Schema({
    name: String,
    organizer: String,
    tags: [String],
    description: String
});


// collection part
const collection = new mongoose.model("users", Loginschema);
const eventcollect = new mongoose.model("events", Eventschema);


module.exports = { collection, eventcollect };