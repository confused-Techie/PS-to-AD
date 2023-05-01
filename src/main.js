/**
 * @file This is invoked by `./bin/ps2ad.js` or by requirng the main module from
 * another.
 * Which will export the function `run` to be called to kick off our script process.
 */

const fs = require("fs");
const log = require("log-utils");
const v8 = require("v8");
const joi = require("joi");

const configuration = require("./config.js");
const validate = require("./validate.js");
const activedirectory = require("./integrations/activedirectory.js");
const powerschool = require("./integrations/powerschool.js");
const compare = require("./integrations/compare.js");
const mail = require("./integrations/mail.js");

const DEFAULT_CACHE_PATH = "./.cache/";

/**
 * @function run
 * @async
 * @desc Like described in the top level module definition, this function is the
 * main handler to kick off the application lifetime.
 * @param {object} args - The Arguments to pass to the entire application. Valid
 * key value pairs described further in documentation.
 * @returns {TBD} - TDB
 */
async function run(args) {
  console.log(log.heading("PS-to-AD"));
  console.log(log.ok("- Properly Parsed CLI Parameters"));

  // And now we want to import our Config File.
  // And if the process fails `configuration` will exit so we don't need to here.
  let config = await configuration.setup(args);

  console.log(log.ok("- Properly Parsed Configuration File"));

  // Then since for all future FileSystem interactions we want to rely on the
  // configuration cache, lets inject a default if one's not provided.
  if (
    typeof config.app.cachePath === "undefined" ||
    config.app.cachePath === ""
  ) {
    console.log(
      `${log.warning} - No Default Cache Path configured. Configuring automatically`
    );
    config.app.cachePath = DEFAULT_CACHE_PATH;
  }

  if (config.app.verbose) {
    const structuredClone = (obj) => {
      return v8.deserialize(v8.serialize(obj));
    };

    let printConfig = structuredClone(config);
    printConfig.email.pass = "****";
    printConfig.server.secret = "****";
    printConfig.editUser.password = "****";
    console.log(printConfig);
  }

  let psData = await powerschool.managePowerSchoolData(config);

  let adData = await activedirectory.manageActiveDirectoryData(config);

  console.log(log.ok("Gather data from PowerSchool & Active Directory"));

  try {
    let validPS = await validate.powerschool.validateAsync(psData);

    let validAD = await validate.active_directory.validateAsync(adData);

    console.log(log.ok("Validated data formats returned"));
  } catch (err) {
    console.error("Data returned is an unexpected format!");
    console.error(err);
    console.error("Cannot safely modify data!");
    process.exit(100);
  }

  /// Now we have collected our two chunks of data.
  // But the first time run will actually need to do the initial matching of
  // items, whereas additional runs afterwards will not have to do the
  // same thing.

  let adWithDCID = await compare.compare(psData, adData, config);

  if (config.app.verbose) {
    console.log(log.ok("Compare Done"));
  }

  let date = new Date();
  fs.writeFileSync(
    `${
      config.app.cachePath
    }/change_table_${date.getDay()}.${date.getMonth()}.${date.getFullYear()}.json`,
    JSON.stringify(adWithDCID, null, 2),
    { encoding: "utf8" }
  );

  if (config.app.sendEmail) {
    // Then send an email
    let sentSuccess = await mail.send(
      JSON.stringify(adWithDCID, null, 2),
      config
    );

    if (sentSuccess) {
      console.log(log.ok("Sent Email Successfull"));
    } else {
      console.log(`${log.warning} - Failed to send email`);
    }
  }
}

module.exports = {
  run,
};
