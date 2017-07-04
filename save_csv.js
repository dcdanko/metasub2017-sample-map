const d3 = require("d3");
const fs = require("fs");

d3.json("http://metasub-kobo-wrapper.herokuapp.com/104862", (error, data) => {
  console.log(data[0]);
});