const config = require("./config.js");
const powerschool = require("./integrations/powerschool.js");

function run(args) {
  console.log(args);
  console.log("here");
}

module.exports = {
  run,
};
