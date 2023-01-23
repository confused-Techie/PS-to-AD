const win = require("node-windows");
const child_process = require("node:child_process");

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

async function getStaffListOLD(config) {
  // We then want to start an elevted process to read the entire AD

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
        return "Success";
      }
    );
  } catch (err) {
    throw err;
    process.exit(1);
  }
}

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
