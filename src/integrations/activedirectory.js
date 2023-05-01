/**
 * @file Exposes the utilities to integrate with Active Directory
 */

const childProcess = require("node:child_process");
const log = require("log-utils");
const fs = require("fs");

async function manageActiveDirectoryData(config) {
  if (config.app.skipAD) {
    // Retreive data from cache
    let data = JSON.parse(
      fs.readFileSync(`${config.app.cachePath}/ad_data.json`, {
        encoding: "utf8",
      })
    );

    console.log(
      log.info + "`skipAD` Set! Skipping Active Directory Data Retreival..."
    );

    return data;
  } else {
    // We want to collect the newest data

    // The below function returns nothing, expecting us to locate our data
    await handleActivedDirectoryData(config);

    let data = JSON.parse(
      fs.readFileSync(`${config.app.cachePath}/ad_data.json`, {
        encoding: "utf8",
      })
    );

    return data;
  }
}

/**
 * @function handleActivedDirectoryData
 * @async
 * @desc A redirect and chained promise around functions exposed from
 * `activedirectory` to access get AD Data saved to disk.
 * On success the return is empty, otherwise throws error.
 * @params {object} config - Our Config Object
 * @returns {} - Empty set of data on success
 */
async function handleActivedDirectoryData(config) {
  // Lets first double check and fail gracefully if we cannot run scripts

  await testExecutionPolicy()
    .then(async (res) => {
      await getStaffList(config)
        .then((resAD) => {
          console.log(
            log.ok(`Active Directory Script has run, returns: ${resAD}`)
          );
          return;
        })
        .catch((err) => {
          throw err;
          process.exit(1);
        });
    })
    .catch((err) => {
      throw err;
      process.exit(1);
    });
}

async function testExecutionPolicy() {
  return new Promise((resolve, reject) => {
    try {
      childProcess.exec(
        "Get-ExecutionPolicy",
        { shell: "powershell.exe" },
        (error, stdout, stderr) => {
          if (error) {
            throw error;
            process.exit(1);
          }

          if (stdout == "Restricted\n" || stdout === "Undefined\n") {
            throw `Windows Execution Policy set to: ${stdout}. Scripts may not be able to run. https:/go.microsoft.com/fwlink/?LinkID=135170`;
            process.exit(100);
          } else {
            console.log("Execution Policy set correctly");
            resolve(stdout);
          }
        }
      );
    } catch (err) {
      throw err;
      process.exit(1);
    }
  });
}

/**
 * @function getStaffList
 * @async
 * @desc A function wrapping a promise that resolves after successfully running
 * the powershell command based on the configuration's script.
 * @returns {string} - ' Success'
 */
async function getStaffList(config) {
  return new Promise((resolve, reject) => {
    // We then want to start the user defined script to get the AD users we care about
    try {
      childProcess.execFile(
        config.adScripts.userList,
        { shell: "powershell.exe" },
        (error, stdout, stderr) => {
          if (error) {
            throw error;
            process.exit(1);
          }

          resolve("Success");
        }
      );
    } catch (err) {
      throw err;
      process.exit(1);
    }
  });
}

/**
  * @function addAttribToUser
  * @async
  * @desc A function wrapping a promise that resolves after successfully running
  * the powershell command based on the configuration's script.
  * @param {string} user - The user to modify
  * @param {string} attrib - The Attribute to add to the user
  * @param {object} config - The global configuration object
  * @returns {string} - 'Success'
  */
async function addAttribToUser(user, attrib, config) {
  return new Promise((resolve, reject) => {
    try {
      // We are wrapping each string in quotes in case they contain non-CLI safe characters
      childProcess.execFile(
        config.adScripts.editUser,
        [ "-user", `"${user}"`, "-attrib", `"${attrib}"`, "-credUser", `"${config.editUser.username}"`, "-credPass", `"${config.editUser.password}"` ],
        { shell: "powershell.exe" },
        (error, stdout, stderr) => {
          if (error) {
            throw error;
            process.exit(1);
          }

          resolve("Success");
        }
      );
    } catch(err) {
      throw err;
      process.exit(1);
    }
  });
}

module.exports = {
  getStaffList,
  testExecutionPolicy,
  manageActiveDirectoryData,
  addAttribToUser,
};
