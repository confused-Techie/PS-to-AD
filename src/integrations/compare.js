/**
 * @file This contains the functions used for comparison and matching.
 */
const activedirectory = require("./activedirectory.js");
const rules = require("../compareRules/rules.js");

/**
 * @function compare
 * @async
 * @desc Compares data between both data sources to transform them as needed.
 * @param {object} psData - The PowerSchool Data Object as read from disk.
 * @param {object} adData - The ActiveDirectory Data Object as read from disk.
 * @param {object} config - The normalized config
 * @returns {object} Will return a `change_table` an object structure of changes
 * waiting to take effect.
 */
async function compare(psData, adData, config) {
  // The comparison function here needs to take the saved cached files of AD Data
  // and PS Data, and find the items that match up between them.
  // We won't try to optimize this to much, and instead focus on stability,
  // since PowerSchool is considered the Master copy, we will loop through PS Data
  // while inumerating all data within AD to check for missing, or out of date information.
  // Additionally, we will look for a permenant identifier, to be able to continiously
  // use this

  // But actually we will only use this, since there is no need of the multi-pass system.

  let state = {
    psData: psData,
    adData: adData,
    config: config,
    changeTable: [], // The variable to collect the change status information
    excludeList: [], // Used to have a safety ignore system
    foundSAMs: [], // Used to help speed up ad check
    successMatchesPS: 0,
    successMatchesSecondaryPS: 0,
    nameMatchPS: 0,
    addedDCIDPS: 0,
    failedPS: 0,
    noSyncAD: 0,
    disabledUserAD: 0,
    failedAD: 0,
  };

  // Loop through initial checks
  for (let i = 0; i < rules.beforePS.length; i++ ) {
    await rules.beforePS[i][1](state);
  }

  // So lets write this as the only method and cross my damn fingers
  // Assuming we remove support for multiple algo options, and only use the 'recursive'
  for (let schoolIdx = 0; schoolIdx < psData.length; schoolIdx++) {
    let school = psData[schoolIdx];

    staffLoop: for (
      let usrIdx = 0;
      usrIdx < school.details.staffs.staff.length;
      usrIdx++
    ) {
      let user = school.details.staffs.staff[usrIdx];

      // Now lets loop through all the checks we have
      for (let i = 0; i < rules.ps.length; i++) {
        let check = await rules.ps[i][1](user, state);

        if (validRuleReturn(check)) {
          continue staffLoop;
        }
      }

      // We couldn't find the user by DCID or by name. We could keep trying, but for now lets mark error
      state.failedPS++;
      state.changeTable.push(
        `Not Found: (PowerSchool -> Active Directory) ${user?.name?.first_name}, ${user?.name?.last_name}; DCID: ${user?.users_dcid}; Teacher Number: ${user?.local_id}`
      );
    }
  }

  // Now that we have properly matched all users in powerschool, we still have to consider AD users.
  // But since powerschool is the master copy this will have to be done differently.
  adLoop: for (let usrIdx = 0; usrIdx < adData.length; usrIdx++) {
    let user = adData[usrIdx];

    // Loop through our AD rules
    for (let i = 0; i < rules.ad.length; i++) {
      let check = await rules.ad[i][1](user, state);

      if (validRuleReturn(check)) {
        continue adLoop;
      }
    }

    // Which since PowerSchool is the master copy, in the future the resulting
    // items here may be up for deletion. For now though lets log nicely
    state.failedAD++;
    state.changeTable.push(
      `Not Found: (Active Directory -> PowerSchool) ${user?.GivenName}, ${user?.Surname}; ${user?.SamAccountName}; last Logon Timestamp: ${user?.lastLogon}`
    );
  }

  console.log(`Exclude List Table Length: ${state.excludeList.length}`);
  console.log("PowerSchool Stats:");
  console.log(
    `DCID Already Present: ${state.successMatchesPS} - DCID in EmployeeID: ${state.successMatchesSecondaryPS} - Name Successfully Matched: ${state.nameMatchPS} - Added DCID: ${state.addedDCIDPS} - No Match: ${state.failedPS}`
  );
  console.log("Active Directory Stats:");
  console.log(
    `NoSync Set: ${state.noSyncAD} - Disabled Account: ${state.disabledUserAD} - Failed to Match: ${state.failedAD}`
  );
  return state.changeTable;
}

function validRuleReturn(val) {
  if (typeof val === "boolean" && val) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  compare,
};
