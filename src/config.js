/**
 * @file This module exports utilities helpful for finding and managing the application
 * configuration.
 */

const fs = require("fs");
const yaml = require("js-yaml");
const log = require("log-utils");

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
      skipPS: args.skip_ps ?? config.app?.skip_ps,
      skipAD: args.skip_ad ?? config.app?.skip_ad,
      cachePath: args.cache_path ?? config.app?.cache_path ?? undefined,
      domain: args.domain ?? config.app?.domain,
      sendEmail: args.sendEmail ?? config.app?.sendEmail,
      attribute: args.attribute ?? config.app?.attribute,
    },
    adScripts: {
      userList: args.ad_script_user_list ?? config?.ad_scripts?.user_list,
    },
    email: {
      to: args.email_to ?? config.email?.to,
      from: args.email_from ?? config.email?.from,
      host: args.email_host ?? config.email?.host,
      port: args.email_port ?? config.email?.port,
      pass: args.email_pass ?? config.email?.pass,
    },
  };
}

/**
 * @function setup
 * @desc Handles the initial configuration setup. To where the main module
 * should only have to provide a configuration here and not worry about the rest
 * of the configuration validation.
 * @param {object} args - The arguments from the CLI.
 */
async function setup(args) {
  // We will want to import out Config File.
  let config = await getConfig(args.config);

  // Then afterwards we want to normalize the data between our CLI ARGS and Config File
  config = await normalize(args, config);

  config = config ?? false;

  if (!config) {
    console.log(
      `${log.error} - Retreiving the configuration returned 'null'. Check your path again.`
    );
    throw new Error("Unable to Parse Configuration");
    process.exit(100);
  }

  return config;
}

module.exports = {
  getConfig,
  normalize,
  setup,
};
