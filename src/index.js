const express = require("express");
const path = require("path");
const { collection, eventcollect } = require("./config");
const bcrypt = require('bcrypt');

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/home", async (req, res) => {
    try {
        const searchQuery = req.query.search || ""; // Get search query from URL (if any)

        const events = await eventcollect.find({
            $or: [
                { name: { $regex: searchQuery, $options: "i" } }, // Search in event name
                { description: { $regex: searchQuery, $options: "i" } }, // Search in description
                { organizer: { $regex: searchQuery, $options: "i" } }, // Search in organizer
                { tags: { $regex: searchQuery, $options: "i" } } // Search in tags
            ]
        });

        res.render("home", { events, searchQuery }); // Pass events and search query to frontend
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send("Error fetching events");
    }
});

app.get("/addevent", (req, res) => {
    res.render("addevent");
});

app.get("/group/:id", async (req, res) => {
    try {
        const event = await eventcollect.findById(req.params.id); // Find event by ID
        if (!event) {
            return res.status(404).send("Event not found");
        }
        res.render("groupdetails", { event }); // Pass event data to the template
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).send("Error loading event details");
    }
});


// Register User
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send('User already exists. Please choose a different username.');
    } else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the original password with the hashed one

        const userdata = await collection.insertMany(data);
        console.log(userdata);

        res.redirect("/login");
    }

});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("User name cannot found")
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        }
        else {
            res.redirect("/home");
        }
    }
    catch {
        res.send("wrong Details");
    }
});


app.post("/addevent", async (req, res) => {
    try {
        const { name, organizer, tags, description } = req.body;

        // Create new event entry
        const newEvent = new eventcollect({
            name,
            organizer,
            tags,
            description
        });

        await newEvent.save(); // Save to MongoDB
        console.log("Event added:", newEvent);

        res.status(201).json({ message: "Event added successfully", event: newEvent });

    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({ error: "Failed to add event" });
    }
});






// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});