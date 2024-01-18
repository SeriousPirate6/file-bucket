const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();

/*
 * Middleware to handle JSON, raw text and URL-encoded bodies
 */
app.use(express.json()); // Parse application/json
app.use(express.text()); // Parse text/plain
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

const port = 3000;

app.get(`/getFile/:fileName`, (req, res) => {
  const extname = path.extname(req.params.fileName).toLowerCase();

  if([
      ".jpg", ".jpeg", ".png", ".mp4", ".avi", ".mkv", ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a"
  ].includes(extname)) {
    res.sendFile(path.resolve(path.join(__dirname, req.params.fileName)));
  } else {
    res.sendStatus(404).send({ status: "not found", message: "Requested file not found." })
  }
});

app.get("/listFiles", ({ res }) => {
  const files = fs.readdirSync(__dirname);

  /*
   * filtering the array to return only media files
   */
  const mediaFiles = files.filter((file) => {
    const extname = path.extname(file).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".mp4", ".avi", ".mkv", ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a"]
        .includes(extname);
  });

  res.send({ mediaFiles });
});

app.put("/uploadFile/:fileName", (req, res) => {
  const fileName = req.params.fileName

  let data = Buffer.from([]);

  req.on("data", (chunk) => {
    data = Buffer.concat([data, chunk]);
  });

  req.on("end", () => {
    fs.writeFile(path.join(__dirname, fileName), data, (err) => {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        res.send({ status: "failed", message: "Internal Server Error" });
      } else {
        res.statusCode = 200;
        res.send({ status: "success", message: "File uploaded successfully" });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
