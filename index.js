let urlDatabase = {};

// Import .env, cors, bodyParser, isUrl, and express
// Set "app" to be the server object
require("dotenv").config();
const isUrl = require("is-url");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());

// Middleware is used to decode the body of the req
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Serve static css file from public directory using middleware
app.use("/public", express.static(`${process.cwd()}/public`));

// Home http route that serves the html file
app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// API endpoint route that returns a greeting in JSON
app.get("/api/hello", function(req, res) {
  res.json({ "greeting": "hello API" });
});

// API endpoint that captures a custom URL, creates a short URL
// Sends URL info back in JSON
app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

  // Check for valid URL
  if (isUrl(url)) {

    // Check if the URL already exists in the database
    let foundUrl;
    for (const storedUrl in urlDatabase) {
      if (urlDatabase[storedUrl] === url) {
        foundUrl = storedUrl;
        break;
      }
    }

    // Generate a new short URL if not found
    let shortUrl;
    if (!foundUrl) {
      shortUrl = Object.keys(urlDatabase).length + 1;
      urlDatabase[shortUrl] = url;
    } else {
      shortUrl = foundUrl;
    }

    // Send URL info back in JSON
    res.json({
      "original_url": url,
      "short_url": shortUrl
    });
  } else {
    // Send error JSON back
    res.json({ 
      "error": "invalid url"
    });
  }
});

// API endpoint that redirects user to stored URL based on shortUrl
app.get("/api/shorturl/:shortUrlId", (req, res) => {

  let shortUrl = req.params.shortUrlId;
  let originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ "error": "Short URL not found" });
  }
});

// Listen on port set in environment variable or default to 3000
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
