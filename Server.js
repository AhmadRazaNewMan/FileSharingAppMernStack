require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const fileController = require('./Controllers/fileController');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });

app.set('view engine', "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", fileController.getIndex);
app.post('/upload', fileController.uploadFile);
app.route("/file/:id").get(fileController.handleDownload).post(fileController.handleDownload);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
