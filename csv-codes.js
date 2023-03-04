const { Parser } = require("json2csv");
const fs = require("fs");

const myCars = [
  {
    car: "Audi",
  },
  {
    price: 35000,
  },
  {
    color: "green",
  },
];
let arr = ["patato", "apple", "mango", "banana"];

// const fields = ["field1", "field2", "field3"];
// const opts = { fields };

const parser = new Parser();
const csv = parser.parse(myCars); // input should be an array..

fs.writeFileSync("./data.csv", csv);
