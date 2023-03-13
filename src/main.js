/**
 * @file This is invoked by `./bin/ps2ad.js` or by requirng the main module from
 * another.
 * Which will export the function `run` to be called to kick off our script process.
 */

const fs = require("fs");
const log = require("log-utils");

const activedirectory = require("./integrations/activedirectory.js");
const compare = require("./integrations/compare.js");
const configuration = require("./config.js");
const powerschool = require("./integrations/powerschool.js");

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
    console.log(config);
  }

  let psData = await powerschool.managePowerSchoolData(config);

  let adData = await activedirectory.manageActiveDirectoryData(config);

  /// Now we have collected our two chunks of data.
  // But the first time run will actually need to do the initial matching of
  // items, whereas additional runs afterwards will not have to do the
  // same thing.

  if (config.app.initial) {
    // With this option then from here we would need to do the
    // initial migration steps
    let adWithDCID = await compare.initial(psData, adData, config);

    if (config.app.verbose) {
      console.log(log.ok("Initial Migrate Done"));
      //console.log(ad_with_dcid);
      fs.writeFileSync(
        `${config.app.cachePath}/tmp_migrate_data.json`,
        JSON.stringify(adWithDCID, null, 2),
        { encoding: "utf8" }
      );
    }
  } else {
    // We don't have any initial migrations steps specified. So now we
    // would want to compare
    console.log(`${log.warning} Compare not yet supported`);
  }
}

module.exports = {
  run,
};
