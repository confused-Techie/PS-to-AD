/**
 * @module activedirectory
 * @desc Exposes the utilities to integrate with Active Directory
 */

const win = require("node-windows");
const child_process = require("node:child_process");

/**
 * @function checkProcessStatus
 * @async
 * @desc A currently unused function used to check if the current process running NodeJS is an admin.
 * @returns {object} A server status object where `ok` is true or false based on success.
 */
async function checkProcessStatus() {
  // This should be used to ensure we have any permissions needed to run the process.
  // Essentially checkin if we are in an admin process, or if we need to get ourselves
  // into an admin process.

  try {
    win.isAdminUser((isAdmin) => {
      if (isAdmin) {
        return {
          ok: true,
          msg: "This Process is an administrative process.",
        };
      }
      // We are not in an admin process, and should try and elvate it.
      return {
        ok: false,
        msg: "This Process is NOT an Admin process.",
      };
    });
  } catch (err) {
    throw err;
    process.exit(1);
  }
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
      child_process.execFile(
        config.ad_scripts.user_list,
        { shell: "powershell.exe" },
        (error, stdout, stderr) => {
          if (error) {
            throw error;
            process.exit(1);
          }

          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          resolve("Success");
        }
      );
    } catch (err) {
      throw err;
      process.exit(1);
    }
  });
}

module.exports = {
  checkProcessStatus,
  getStaffList,
};
