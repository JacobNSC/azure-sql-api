//Tedious module require and connection JSON details
const { columns } = require("mssql");
const { Connection, Request } = require("tedious");
const config = require("./connection.json");

//Set up new connection with config
const connection = new Connection(config);

//Connect to the DB and log connected/error
connection.on("connect", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Connected to SQL server sucessfully.`);
  }
});

//Universal function to dynamically genearte JSON
//Takes the current row object and iterates through
//Returns "row" which is an object key/value pair
function createJSON(currentRow) {
  //Create empty object
  var rowObject = {};

  //Iterate through each column in the row object
  for (column in currentRow) {
    rowObject[currentRow[column].metadata.colName] = currentRow[column].value;
  }

  //Return final object
  return rowObject;
}

//Function to search the component table
//Takes COCNum, PlantNum, CompDesc and a callback function
function componentSearch(
  COCNum = "IS NULL OR COCNum IS NOT NULL",
  PlantNum = "%",
  CompDesc = "%",
  callback
) {
  //Set up and empty array to push row objects into
  const sqlResults = [];

  //Create request with SQL query inside
  const request = new Request(
    `SELECT * FROM Component WHERE COCNum ${COCNum} AND PlantNum LIKE '${PlantNum}' AND CompDesc LIKE '${CompDesc}'`,
    function (err, rowCount) {
      if (err) {
        //Pass error message to callback function
        callback(err.message);
      } else {
        //Pass JSON object to callback function
        callback(sqlResults);
      }
    }
  );

  //Every time the "row" event occurs, fire the below
  request.on("row", function (row) {
    //Use the createJSON object to get an object
    //Push that object into the array
    sqlResults.push(createJSON(row));
  });

  //Execute the SQL query
  connection.execSql(request);
}

//Function to add component
//TODO: Not working currently
function componentAdd(component, callback) {
  const request = new Request(
    `DECLARE @json NVARCHAR(MAX)
    SET @json='${component}'
    SELECT * FROM
    OPENJSON(@json)`,
    function (err, rowCount) {
      if (err) {
        console.log(err.message);
      } else {
        callback();
      }
    }
  );
  connection.execSql(request);
}

//Function to update given component
//TODO: Not working currently
function componentUpdate(component, callback) {}

//Function to delete component based on given UniqueID
function componentDelete(UniqueID, callback) {
  //Create request with SQL delete query
  const request = new Request(
    `DELETE FROM Component WHERE UniqueID = '${UniqueID}'`,
    function (err, rowCount) {
      if (err) {
        //Pass error message to callback function
        callback(err.message);
      } else {
        //Pass "200" message to callback function
        callback("200");
      }
    }
  );

  //Execute SQL Query
  connect.execSql(request);
}

//Export functions for use in index.js (require)
exports.componentSearch = componentSearch;
exports.componentDelete = componentDelete;
exports.componentAdd = componentAdd;
exports.componentUpdate = componentUpdate;
