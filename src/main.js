const configuration = require("./config.js");
const powerschool = require("./integrations/powerschool.js");
const activedirectory = require("./integrations/activedirectory.js");
const compare = require("./integrations/compare.js");
const log = require("log-utils");
const fs = require("fs");

const DEFAULT_CACHE_PATH = "./.cache/";

async function run(args) {
  console.log(log.heading('PS-to-AD'));
  console.log(log.ok("- Properly Parsed CLI Parameters"));

  // And now we want to import our Config File.
  let config = await configuration.getConfig(args.config);
  // Then lets normalize our configuration between CLI ARGS and Config File
  config = configuration.normalize(args, config);

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

  if (config.app.verbose) {
    console.log(config);
  }

  let ps_data = null;

  if (config.app.skip_ps) {
    // We are skipping external call, get cache
    ps_data = JSON.parse(fs.readFileSync(`${config.app.cache_path}/ps_data.json`,
              { encoding: "utf8" }));
    console.log("`skip_ps` Set! Skiping Powerschool Data Retreival...");
  } else {
    // Now with a known good config, we will firstly setupPowerSchool
    let ps_data_loc = await setupPowerSchool(config);
    // setupPowerSchool returns the location of data on disk that stores the file.
    ps_data = JSON.parse(fs.readFileSync(ps_data_loc), { encoding: "utf8" });
  }

  let ad_data = null;

  if (config.app.skip_ad) {
    ad_data = JSON.parse(fs.readFileSync(`${config.app.cache_path}/ad_data.json`), {
        encoding: 'utf8'
    });
    console.log("`skip_ad` Set! Skipping Active Directory Data Retreival...");
  } else {
    // And now we need to get the data from Active Directory
    let ad_return = await setupAD(config, args);
    // setupAD returns empty, and expects us to find it's file location
    ad_data = JSON.parse(fs.readFileSync(`${config.app.cache_path}/ad_data.json`), {
      encoding: "utf8"
    });
  }

  /// Now we have collected our to chunks of data.
  // But the first time run will actually need to do the initial matching of items, whereas
  // additional runs afterwards will not have to do the same thing.

  if (config.app.initial) {
    // With this option then from here we would need to do the initial migration steps
    let ad_with_dcid = await compare.initial(ps_data, ad_data, args, config);

    if (config.app.verbose) {
      console.log(log.ok("Initial Migrate Done"));
      //console.log(ad_with_dcid);
      fs.writeFileSync(`${config.app.cache_path}/tmp_migrate_data.json`, JSON.stringify(ad_with_dcid, null, 2), { encoding: "utf8"});
    }
  } else {
    // We don't have any initial migrations steps specified. So now we would want to compare

  }
}

async function setupPowerSchool(config) {
  // Now lets make sure we have the credentials needed for powerschool and that
  // they can be transformed successfully.
  if (typeof config.server.id !== "string" || typeof config.server.secret !== "string" || typeof config.server.url !== "string") {
    console.log(`${log.error} - Failed to confirm type validity of PowerSchool ID, Secret, or URL`);

    if (config.app.verbose) {
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

  if (config.app.verbose) {
    console.log(log.ok(`- PowerSchool Access Token: ${ps_auth}`));
  }

  // Now with our token, it's time to get the powerschool staff data

  if (config.app.verbose) {
    console.log(log.heading('Retreive Data from PowerSchool'));
  }

  let ps_data = await powerschool.getStaffList(config.schools, config.server.url, ps_auth);

  console.log(log.ok("- Successfully Collected Data from PowerSchool"));

  // Now lets save the data to disk, to ensure we don't need to request again unless needed.
  fs.writeFileSync(`${config.app.cache_path}/ps_data.json`, JSON.stringify(ps_data, null, 2), { encoding: "utf8" });
  console.log(log.ok("- Successfully Cached PowerSchool Data"));

  return `${config.app.cache_path}/ps_data.json`;
}

async function setupAD(config) {

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
