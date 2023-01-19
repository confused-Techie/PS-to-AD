#!/usr/bin/env node

var argv = require("yargs/yargs")(process.argv.slice(2))
            .usage('Usage: $0 <command> [options]')
            .command('ps2ad', 'Detect and resolve differences in PowerSchool to Active Directory')
            .alias('c', 'config')
            .alias('h', 'help')
            .alias('v', 'version')
            .describe('c', 'Point to a configuration file.')
            .describe('verbose', 'Verbose logging while running')
            .demandOption([ 'c' ])
            .describe('initial', 'Boolean to indicate if initial migrations should occur.')
            .describe('algo', 'Determines what Algorithm or Method should be used during comparison')
            .describe('cache_path', 'Specifies the folder location to use for the Application Cache Path')
            .option('skip_ad', {
              description: 'Skip any steps that involve contacting Active Directory',
              type: 'boolean',
              default: false,
              demandOption: false
            })
            .option('skip_ps', {
              description: 'Skip any steps that involve contacting Active Directory',
              type: 'boolean',
              default: false,
              demandOption: false
            })
            .argv;

module.exports = require("../src/main.js").run(argv);
