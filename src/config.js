const fs = require("fs");
const yaml = require("js-yaml");

function getConfig(configLoc) {
  try {

    let data = null;

    try {
      let fileContent = fs.readFileSync(configLog, "utf8");
      data = yaml.load(fileContent);
    } catch(err) {
      throw err;
    }

    return data;

  } catch(err) {
    throw err;
  }
}

module.exports = {
  getConfig,
};
