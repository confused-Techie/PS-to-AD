#!/usr/bin/env node

var argv = require("yargs/yargs")(process.argv.slice(2))
            .usage('Usage: $0 <command> [options]')
            .command('ps2ad', 'Detect and resolve differences in PowerSchool to Active Directory')
            .alias('c', 'config')
            .alias('h', 'help')
            .alias('v', 'version')
            .describe('c', 'Point to a configuration file.')
            .demandOption([ 'c' ])
            .option('c', {
              alias: 'config',
              description: 'Point to a configuration file.',
              type: 'string',
              demandOption: true
            })
            .option('algo', {
              description: 'Determines what Algorithm or Method should be used during comparison',
              type: 'string',
              demandOption: false
            })
            .option('domain', {
              description: 'Specifies the Domain for you orgs email',
              type: 'string',
              demandOption: false
            })
            .option('cache_path', {
              description: 'Specifies the folder location to use for the Application Cache Path',
              type: 'string',
              demandOption: false
            })
            .option('initial', {
              description: 'Boolean to indicate if initial migrations should occur.',
              type: 'boolean',
              demandOption: false
            })
            .option('verbose', {
              description: 'Verbose logging while running',
              type: 'boolean',
              demandOption: false
            })
            .option('skip_ad', {
              description: 'Skip any steps that involve contacting Active Directory',
              type: 'boolean',
              demandOption: false
            })
            .option('skip_ps', {
              description: 'Skip any steps that involve contacting Active Directory',
              type: 'boolean',
              demandOption: false
            })
            .option('server_id', {
              description: 'ID Of the Custom Plugin Created for PowerSchool',
              type: 'string',
              demandOption: false
            })
            .option('server_secret', {
              description: 'Secret of the Custom Plugin Created for PowerSchool',
              type: 'string',
              demandOption: false
            })
            .option('server_url', {
              description: 'URL Of your PowerSchool Instance',
              type: 'string',
              demandOption: false
            })
            .option('ad_script_user_list', {
              description: 'Define a custom file location to retreive a User List from AD',
              type: 'string',
              demandOption: false,
              hidden: true
            })
            .argv;

module.exports = require("../src/main.js").run(argv);
