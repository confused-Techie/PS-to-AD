const fs = require("fs");
const yaml = require("js-yaml");

function getConfig(configLoc) {
  try {

    let data = null;

    try {
      let fileContent = fs.readFileSync(configLoc, "utf8");
      data = yaml.load(fileContent);
    } catch(err) {
      throw err;
    }

    return data;

  } catch(err) {
    throw err;
  }
}

function normalize(args, config) {
  // Takes a Config file and CLI Arguments
  // normalizing the data into a single object.
  // CLI Arguments are prioritized
  return {
    schools: config.schools,
    server: {
      id: args.server_id ?? config.server?.id,
      secret: args.server_secret ?? config.server?.secret,
      url: args.server_url ?? config.server?.url
    },
    app: {
      verbose: args.verbose ?? config.app?.verbose,
      skip_ps: args.skip_ps ?? config.app?.skip_ps,
      skip_ad: args.skip_ad ?? config.app?.skip_ad,
      initial: args.initial ?? config.app?.initial,
      cache_path: args.cache_path ?? config.app?.cache_path,
      domain: args.domain ?? config.app?.domain,
      algo: args.algo ?? config.app?.algo
    },
    ad_scripts: {
      user_list: args.ad_script_user_list ?? config?.ad_scripts?.user_list
    }
  };
}

module.exports = {
  getConfig,
  normalize,
};
