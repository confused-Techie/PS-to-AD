#!/usr/bin/env node

var argv = require("yargs/yargs")(process.argv.slice(2))
            .usage('Usage: $0 <command> [options]')
            .command('ps2ad', 'Detect and resolve differences in PowerSchool to Active Directory')
            .alias('c', 'config')
            .alias('h', 'help')
            .alias('v', 'version')
            .describe('c', 'Point to a configuration file.')
            .demandOption([ 'c' ])
            .argv;

module.exports = require("../src/main.js").run(argv);
