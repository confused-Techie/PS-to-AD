/**
 * @module conifg
 * @desc This module exports utilities helpful for finding and managing the application
 * configuration.
 */

const fs = require("fs");
const yaml = require("js-yaml");

/**
 * @function getConfig
 * @desc The main function that actually exports the configuration.
 * @param {string} configLoc - The user defined, or default file system location
 * of the configuration file.
 * @returns {object} Returns the YAML Parsed file, or will error if no data is found.
 */
function getConfig(configLoc) {
  try {
    let data = null;

    try {
      let fileContent = fs.readFileSync(configLoc, "utf8");
      data = yaml.load(fileContent);
    } catch (err) {
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * @function normalize
 * @desc This function takes the contents of the return for `getConfig` and the object
 * passed user config and will combine them into a single configuration.
 * Always prioritizing CLI parameters over Config File
 * @param {object} args - The arguments from the CLI.
 * @param {object} config - The configuration from the file system.
 */
function normalize(args, config) {
  // Takes a Config file and CLI Arguments
  // normalizing the data into a single object.
  // CLI Arguments are prioritized
  return {
    schools: config.schools,
    server: {
      id: args.server_id ?? config.server?.id,
      secret: args.server_secret ?? config.server?.secret,
      url: args.server_url ?? config.server?.url,
    },
    app: {
      verbose: args.verbose ?? config.app?.verbose,
      skip_ps: args.skip_ps ?? config.app?.skip_ps,
      skip_ad: args.skip_ad ?? config.app?.skip_ad,
      initial: args.initial ?? config.app?.initial,
      cache_path: args.cache_path ?? config.app?.cache_path,
      domain: args.domain ?? config.app?.domain,
      algo: args.algo ?? config.app?.algo,
    },
    ad_scripts: {
      user_list: args.ad_script_user_list ?? config?.ad_scripts?.user_list,
    },
  };
}

module.exports = {
  getConfig,
  normalize,
};
