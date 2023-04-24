To run the bin:

`node bin/ps2ad.js --dev_override false`

To run the script:

`npm start -- --dev_override false`

Quick Notes:

- AD employeeNumber will contain the dcid

Example Command: (Local)
`npm start -- -c './conf.yaml'`

Example Command: (None Local)
`ps-to-add -c './conf.yaml'`

Example Config File:

```yaml
schools:
  - id: 0
    name: "Elementary School"
  - id: 1
    name: "Junior High School"
  - id: 2
    name: "High School"
server:
  id: "POWER_SCHOOL_SERVER Plugin ID",
  secret: "POWER_SCHOOL_SERVER_Plugin Secret",
  url: "Power_School_URL"
app:
  verbose: true|false
  skip_ps: true|false # Skip PowerSchool remote data collection. Uses local cache
  skip_ad: true|false # Skip Active Directory remote data collection. Uses Local cache
  cache_path: "The path for all cached data storage."
  domain: "OPTIONAL - Email Domain"
  sendEmail: true|false # Whether or not to send an email with results of the run afterwards.
  attribute: "The attribute name within AD to use for PS2AD"
ad_scripts:
  user_list: "Path to a script that will output users into the `cache` folder."
email:
  to: "Email address to send to"
  from: "The email to send from"
  host: "Server Hostname for email"
  port: "The Server's port for email"
  pass: "The password to the email address to send from"
```

## Developer Notes

This Project uses [JSDoc](https://jsdoc.app/index.html) within Code to keep documentation.

## Active Directory Effects

Since this program will interact with active directory you're able to set the attribute you'd like the program to use by setting `app.attribute` within the config.

This value can be anything, but will be used for placing DCID id's, as well as should be used when setting `ps2ad:no-sync` to ignore an item within ad during sync.

## Usage

To get setup with `PS2AD` just use the following steps:

1) Copy this repository locally.
2) Within the root folder of the repository run `npm install` to install all needed dependencies 
3) Afterwards create your script to retreive a list of all Active Directory users. This can be placed wherever you'd like, and be whatever you'd like. But an example script is in `./example_scripts/`. Ensure the output file is written to `.cache/ad_data.json`
4) Create your `conf.yml` which will contain all configuration data for the application. Within you can point to your scripts, and to the cache folder and anything else needed. You can use the example config above
5) Finally run the application while pointing to your file configuration. If you'd like to install globally to be able to run it as a bin just use `npm install . -g`
