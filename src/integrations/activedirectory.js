/**
 * @file Exposes the utilities to integrate with Active Directory
 */

const child_process = require("node:child_process");

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
