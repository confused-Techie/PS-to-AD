const helper = require("./helpers.js");

async function dcidMatchEmployeeID(user, state) {
  if (state.config.app?.checkEmployeeID) {
    // Then lets check in case the employee contains the right dcid
    let extMatch = await helper.adFindByAttribute(
      state.adData,
      user?.users_dcid,
      "EmployeeID"
    );

    if (extMatch !== null) {
      state.successMatchesSecondaryPS++;
      if (state.config.app.outputMatched) {
        state.changeTable.push(
          `DCID Matched (employeeID): ${users?.users_dcid} to ${manExtMatch?.SamAccountName}; User OK!`
        );
      }
      state.foundSAMs.push(extMatch.SamAccountName);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

module.exports = dcidMatchEmployeeID;
