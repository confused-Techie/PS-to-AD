To run the bin:

`node bin/ps2ad.js --dev_override false`

To run the script:

`npm start -- --dev_override false`

Quick Notes:

- AD employeeNumber will contain he dcid


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
  skip_ps: true|false # Skip PowerSchell logging
  initial: true|false # Weather or not to complete first time migration
  cache_path: "The path for all cahced data storage."
  domain: "OPTIONAL - Email Domaain"
  algo: "Algoritm used to compare and migrate the data checked."
ad_scripts:
  user_list: "Path to a script that will output users into the `cache` folder."
```

# Developer Notes

This Project uses [JSDoc](https://jsdoc.app/index.html) within Code to keep documentation.
