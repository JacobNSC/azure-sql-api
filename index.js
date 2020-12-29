//TODO - Write error logging function

//Require express and the sqlQueries.js file
const express = require("express");
const {
  componentSearch,
  componentDelete,
  componentAdd,
  componentUpdate,
} = require("./database/sqlQueries");
var bodyParser = require("body-parser");

//Create app from express oject
const app = express();

//Allows calls to/from this site (Cross Origin Resource Sharing)
var cors = require("cors");

//Set the app to expect/handle JSON
// and to use CORS by default
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//Base URL for the API
//React should handle this base page anyway
//This part should probably be Swagger Documentation
app.get("/", (req, res) => {
  res.send("<h1>MDEx API EndPoint. <br>Please use with caution.</h1>");
});

//Query the component table for all items with specific
// PlantNum, COCNum and CompDesc.
// If no values  passed, uses a wildcard (%),
// except for COCNum which passes IS NULL OR NOT NULL
app.get("/component", (req, res) => {
  //Start a timer to track query length
  console.time("compSearch");

  //Call the comopnentSearch function with the given PlantNum
  componentSearch(
    req.body.COCNum,
    req.body.PlantNum,
    req.body.CompDesc,
    function (data) {
      res.send(data);
      //Stop the timer show results on completion
      console.log(`Search complete. Time below`);
      console.timeEnd("compSearch");
    }
  );
});

//Creates a new component
//Takes the whole body (JSON object)
//TODO: Error catching pass different status
app.post("/component", (req, res) => {
  //Start a timer to track the query length
  console.time("compAdd");

  //Call the componentAdd function to create new component
  componentAdd(req.body, function () {
    //Stop timer and show results
    console.log(`Add component complete. Time below`);
    console.time("compAdd");

    //Send a HTTP 200 status
    res.send(200);
  });
});

//TODO
app.patch("/component", (req, res) => {
  console.time("compUpdate");
});

//Runs the delete function against component table
//Takes a UniqueID from the body
//TODO: Error catching pass different status
app.delete("/component", (req, res) => {
  //Start a timer to track the query length
  console.time("compDelete");

  componentDelete(req.body.UniqueID, function (status) {
    //Stop timer and show results
    console.log(`Delete complete. Time below`);
    console.timeEnd("compDelete");
    if (status == "200") {
      //Send a HTTP 200 status
      res.sendStatus(200);
    } else {
      //Send a HTTP 500 status
      res.sendStatus(500);
    }
  });
});

//Sets the port to the environment variable PORT or 300 if not defined
const port = process.env.PORT || 3000;

//Starts the Express server listening on the port set
app.listen(port, () => console.log(`Listening on port ${port}...`));
