const multer = require("multer");
const bcrypt = require('bcrypt');
const File = require('../models/File');
const upload = multer({ dest: "uploads" });

async function getIndex(req, res) {
    res.render("index");
}

const uploadFileMiddleware = upload.single("file");

const uploadFile = async (req, res) => {
    // Now, the middleware is executed here
    uploadFileMiddleware(req, res, async (err) => {
        if (err) {
            return res.status(400).send("Error uploading file");
        }

        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const fileData = {
            path: req.file.path,
            originalName: req.file.originalname,
        };

        if (req.body.password !== null && req.body.password !== "") {
            fileData.password = await bcrypt.hash(req.body.password, 10);
        }

        try {
            const file = await File.create(fileData);
            res.render('index', { fileLink: `${req.headers.origin}/file/${file.id}` });
        } catch (error) {
            console.error("Error creating file:", error);
            res.status(500).send("Error creating file");
        }
    });
};

async function handleDownload(req, res) {
    // The rest of the code remains the same
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).send("File not found");
        }

        // Check if the file is password-protected
        if (file.password !== undefined) {
            // If password is not provided in the request body
            if (!req.body.password) {
                return res.render("password");
            }

            // Compare the password for authentication
            if (!(await bcrypt.compare(req.body.password, file.password))) {
                return res.render("password", { error: true });
            }
        }

        // Increment download count
        file.downloadCount++;
        await file.save();
        console.log("Download count:", file.downloadCount);

        // Download the file
        res.download(file.path, file.originalName);
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).send("Error downloading file");
    }
}

module.exports = {
    getIndex,
    uploadFile,
    handleDownload
};
