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

  let changeTable = []; // The variable to collect the change status information
  let foundSAMs = []; // Used to help speed up ad check
  let excludeList = []; // Used to have a safety ignore system

  let successMatchesPS = 0;
  let successMatchesSecondaryPS = 0;
  let nameMatchPS = 0;
  let addedDCIDPS = 0;
  let failedPS = 0;

  let noSyncAD = 0;
  let disabledUserAD = 0;
  let failedAD = 0;

  let state = {
    psData: psData,
    adData: adData,
    changeTable: changeTable,
    excludeList: excludeList,
    successMatchesPS: successMatchesPS,
    successMatchesSecondaryPS: successMatchesSecondaryPS,
    nameMatchPS: nameMatchPS,
    addedDCIDPS: addedDCIDPS,
    failedPS: failedPS,
    noSyncAD: noSyncAD,
    disabledUserAD: disabledUserAD,
    failedAD: failedAD,
    config: config
  };

  rules.duplicatePSUserCheck(state);

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

      let exclusionCheckRes = rules.exclusionCheck(user, state);

      if (validRuleReturn(exclusionCheckRes)) {
        continue;
      }

      let serviceAccountCheckRes = rules.serviceAccountCheck(user, state);

      if (validRuleReturn(serviceAccountCheckRes)) {
        continue;
      }

      let dcidMatchRes = rules.dcidMatch(user, state);

      if (validRuleReturn(dcidMatchRes)) {
        continue;
      }

      let dcidMatchEmployeeIDRes = rules.dcidMatchEmployeeID(user, state);

      if (validRuleReturn(dcidMatchEmployeeIDRes)) {
        continue;
      }

      // Our DCID didn't match, so lets check by name
      let nameMatch = await adFindByFirstLast(
        adData,
        user?.name?.first_name,
        user?.name?.last_name
      );

      if (nameMatch !== null) {
        if (config.app.noWrite) {
          nameMatchPS++;
          changeTable.push(
            `Add DCID: ${user?.users_dcid} to ${nameMatch.SamAccountName}`
          );
          foundSAMs.push(nameMatch.SamAccountName);
          continue;
        } else {
          // We should write our changes
          let ret = await activedirectory.addAttribToUser(
            nameMatch.SamAccountName,
            user.users_dcid,
            config
          );
          nameMatchPS++;
          addedDCIDPS++;
          changeTable.push(
            `Successfully Added- DCID: ${user.users_dcid} to ${nameMatch.SamAccountName}`
          );
          foundSAMs.push(nameMatch.SamAccountName);
        }
      }

      // We couldn't find the user by DCID or by name. We could keep trying, but for now lets mark error
      failedPS++;
      changeTable.push(
        `Not Found: (PowerSchool -> Active Directory) ${user?.name?.first_name}, ${user?.name?.last_name}; DCID: ${user?.users_dcid}; Teacher Number: ${user?.local_id}`
      );
    }
  }

  // Now that we have properly matched all users in powerschool, we still have to consider AD users.
  // But since powerschool is the master copy this will have to be done differently.
  for (let usrIdx = 0; usrIdx < adData.length; usrIdx++) {
    let user = adData[usrIdx];

    let noSync = rules.noSync(user, state);

    if (validRuleReturn(noSync)) {
      continue;
    }

    let foundSAMsCheck = rules.foundSAMsCheck(user, state);

    if (validRuleReturn(foundSAMsCheck)) {
      continue;
    }

    let disabledCheck = rules.disabledCheck(user, state);

    if (validRuleReturn(disabledCheck)) {
      continue;
    }

    let ignoreGroupCheck = rules.ignoreGroupCheck(user, state);

    if (validRuleReturn(ignoreGroupCheck)) {
      continue;
    }

    // Which since PowerSchool is the master copy, in the future the resulting
    // items here may be up for deletion. For now though lets log nicely
    failedAD++;
    changeTable.push(
      `Not Found: (Active Directory -> PowerSchool) ${user?.GivenName}, ${user?.Surname}; ${user?.SamAccountName}; last Logon Timestamp: ${user?.lastLogon}`
    );
  }

  console.log(`Exclude List Table Length: ${excludeList.length}`);
  console.log("PowerSchool Stats:");
  console.log(
    `DCID Already Present: ${successMatchesPS} - DCID in EmployeeID: ${successMatchesSecondaryPS} - Name Successfully Matched: ${nameMatchPS} - Added DCID: ${addedDCIDPS} - No Match: ${failedPS}`
  );
  console.log("Active Directory Stats:");
  console.log(
    `NoSync Set: ${noSyncAD} - Disabled Account: ${disabledUserAD} - Failed to Match: ${failedAD}`
  );
  return changeTable;
}


function validRuleReturn(val) {
  if (typeof val === "boolean" && val) {
    return true;
  } else {
    return false;
  }
}
/**
 * @async
 * @function adFindByFirstLast
 * @desc Takes an Active Directory Data Object and iterates through it
 * until it is able to find a proper match to the first and last name provided.
 * @param {object} ad_data - The ActiveDirectory Object as Read from Disk.
 * @param {string} first - The First name to match
 * @param {string} last - The Last Name to Match
 * @returns {object|null} Returns either the properly indexed location for the entry
 * within the provided ad_data or will return `null`
 */
async function adFindByFirstLast(adData, first, last) {
  for (let i = 0; i < adData.length; i++) {
    if (
      adData[i]["GivenName"].toLowerCase() === first.toLowerCase() &&
      adData[i]["Surname"].toLowerCase() === last.toLowerCase()
    ) {
      return adData[i];
    }
  }
  return null;
}

/**
 * @async
 * @function adFindByAttribute
 * @desc Uses the configured attribute to search for match to the passed data field.
 * @param {object} adData - the active directory data passed.
 * @param {string} ext - The value of the field we are matching against.
 * @param {object} config - The configuration
 * @return {object|null} AN object if the user is found, null otherwise
 */
async function adFindByAttribute(adData, ext, attr) {
  for (let i = 0; i < adData.length; i++) {
    let attrib = parseInt(adData[i][attr]);

    if (attrib === ext) {
      return adData[i];
    }
  }
  return null;
}

module.exports = {
  compare,
};
