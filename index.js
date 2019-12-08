// load the things we need
var express = require("express");
var app = express();

// set the view engine to ejs
app.set("view engine", "ejs");

// Configure static files
app.use(express.static("assets"));
app.use(express.static("data"));

// index page
app.get("/", function(req, res) {
  res.render("component_party_deputy");
});

// deputy page
app.get("/deputies/:id", function(req, res) {
  res.render("component_deputy_expense", { id: req.params.id });
});

app.listen(1337);
