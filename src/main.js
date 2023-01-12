const configuration = require("./config.js");
const powerschool = require("./integrations/powerschool.js");
const activedirectory = require("./integrations/activedirectory.js");
const log = require("log-utils");
const fs = require("fs");

const DEFAULT_CACHE_PATH = "./.cache/";

async function run(args) {
  console.log(log.heading('PS-to-AD'));
  console.log(log.ok("- Properly Parsed CLI Parameters"));

  // And now we want to import out Config File.
  let config = await configuration.getConfig(args.config);

  if (config === null || config === undefined) {
    console.log(`${log.error} - Retreiving the configuration returned 'null'. Check your path again.`);
    throw new Error("Unable to Parse Configuration");
    process.exit(1);
  }

  console.log(log.ok("- Properly Parsed Configuration File"));

  // Then since for all future FileSystem interactions we want to rely on the configuration
  // cache, lets inject a default if one's not provided.
  if (typeof config.app.cache_path === "undefined" || config.app.cache_path === "") {
    console.log(`${log.warning} - No Default Cache Path configured. Configuring automatically`);
    config.app.cache_path = DEFAULT_CACHE_PATH;
  }

  if (args.verbose || config.app.verbose) {
    console.log(config);
  }

  // Now with a known good config, we will firstly setupPowerSchool
  //let ps_setup = await setupPowerSchool(config, args);

  // And now we need to get the data from Active Directory
  let ad_setup = await setupAD(config, args);

  // Now that AD has fully created the file we care about, now we need to compare
  // The lists and create or delete as needed.
}

async function setupPowerSchool(config, args) {
  // Now lets make sure we have the credentials needed for powerschool and that
  // they can be transformed successfully.
  if (typeof config.server.id !== "string" || typeof config.server.secret !== "string" || typeof config.server.url !== "string") {
    console.log(`${log.error} - Failed to confirm type validity of PowerSchool ID, Secret, or URL`);

    if (args.verbose || config.app.verbose) {
      console.log(`${ typeof config.server.id !== "string" ? log.error : log.success} [${typeof config.server.id}] - Server ID: ${config.server.id}`);
      console.log(`${typeof config.server.secret !== "string" ? log.error : log.success} [${typeof config.server.secret}] - Server Secret: ${config.server.secret}`);
      console.log(`${typeof config.server.url !== "string" ? log.error : log.success} [${typeof config.server.url}] - Server URL: ${config.server.url}`);
    }

    throw new Error("Powerschool ID, Secret, URL invalid type");
    process.exit(1);
  }

  let ps_auth = await powerschool.powerschoolCreds(config.server.id, config.server.secret, config.server.url);
  console.log(log.ok("- Successfully retreived Access Token from PowerSchool"));

  if (ps_auth === undefined) {
    // ps_auth is initialized as undefined within our integration, so we check explicitly for it
    console.log(`${log.error} - Was unable to retreive actual Access Token Value from PowerSchool`);
    process.exit(1);
  }

  if (args.verbose || config.app.verbose) {
    console.log(log.ok(`- PowerSchool Access Token: ${ps_auth}`));
  }

  // Now with our token, it's time to get the powerschool staff data

  if (args.verbose || config.app.verbose) {
    console.log(log.heading('Retreive Data from PowerSchool'));
  }

  let ps_data = await powerschool.getStaffList(config.schools, config.server.url, ps_auth);

  console.log(log.ok("- Successfully Collected Data from PowerSchool"));

  // Now lets save the data to disk, to ensure we don't need to request again unless needed.
  fs.writeFileSync(`${config.app.cache_path}/ps_data.json`, JSON.stringify(ps_data, null, 2), { encoding: "utf8" });
  console.log(log.ok("- Successfully Cached PowerSchool Data"));

  return `${config.app.cache_path}/ps_data.json`;
}

async function setupAD(config, args) {

  await activedirectory.getStaffList(config)
    .then((res) => {
      console.log(log.ok(`Active Directory Script has run, returns: ${res}`));
      return;
    })
    .catch((err) => {
      throw err;
      process.exit(1);
    });
}

module.exports = {
  run,
};
