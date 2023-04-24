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

Additionally this project makes the current naive assumtions about Active Directory:

* `extensionAttribute1` Is used to store the DCID of Users in PowerSchool
* `extensionAttribute1` Is used to exclude an AD object from sync. Which to exclude from sync simply define: `ps2ad:no-sync` within that attribute. The alternative of using a DCID there.
