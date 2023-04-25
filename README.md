## PS2AD

PS2AD is a tool that synchronizes data between PowerSchool and Active Directory. To use it, follow these steps:

1. Clone the repository locally.
2. In the root directory of the repository, run `npm install` to install the dependencies.
3. Create a script to retrieve a list of all Active Directory users. This script can be placed anywhere, but it should output the results to a file called `.cache/ad_data.json`.
4. Create a configuration file called `conf.yml`. This file will contain all of the configuration settings for PS2AD. You can use the example configuration file as a starting point.
5. Run the application by passing the path to the configuration file as an argument. For example:

```bash
npm start -- -c ./conf.yml
```

---

Alternatively, you can install PS2AD globally, like so:

```bash
npm install . -g
```

Then you can run the script like so:

```bash
ps2ad -c './conf.yml'
```

## Configuration

The configuration options for PS2AD. All options are available via the configuration file or via the CLI, with the CLI always taking precedence. The following are the available settings:

* **schools:** A list of schools, each with an ID and a name.
* **server:** The ID, secret, and URL of the PowerSchool server.
* **app:** The following settings for the application:
    * **verbose:** Whether or not to print verbose output.
    * **skip_ps:** Whether or not to skip collecting data from PowerSchool.
    * **skip_ad:** Whether or not to skip collecting data from Active Directory.
    * **cache_path:** The path to the cache directory.
    * **domain:** The email domain.
    * **sendEmail:** Whether or not to send an email with the results of the run.
    * **attribute:** The name of the attribute in Active Directory to use for PS2AD.
* **ad_scripts:** The following settings for Active Directory scripts:
    * **user_list:** The path to the script that will output a list of users to the cache directory.
* **email:** The following settings for email:
    * **to:** The email address to send the results to.
    * **from:** The email address to send the results from.
    * **host:** The hostname of the email server.
    * **port:** The port of the email server.
    * **pass:** The password for the email account.

## Developer notes

This project uses [JSDoc](https://jsdoc.app/index.html) to document the code.

## Active Directory effects

This program will interact with Active Directory. You can set the attribute that the program will use by setting the `app.attribute` setting in the configuration file. This value can be anything, but it will be used for placing DCID IDs, as well as should be used when setting `ps2ad:no-sync` to ignore an item within AD during sync.
