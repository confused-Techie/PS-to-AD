/**
 * @file This contains the functions used for comparison and matching.
 */
const activedirectory = require("./activedirectory.js");

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

  // Due to the rare possibility of a user having an identical first and last name in
  // Powerschool we will firstly do a check for this happening, then ensure to ignore
  // then from all future checks and emit a warning

  for (let schoolIdx = 0; schoolIdx < psData.length; schoolIdx++) {
    let school = psData[schoolIdx];

    for (
      let usrIdx = 0;
      usrIdx < school.details.staffs.staff.length;
      usrIdx++
    ) {
      let user = school.details.staffs.staff[usrIdx];

      // Now with this user, we need to loop through every single other user
      // and ensure we don't have any collisions

      for (let schoolColIdx = 0; schoolColIdx < psData.length; schoolColIdx++) {
        let schoolCol = psData[schoolColIdx];

        for (
          let usrColIdx = 0;
          usrColIdx < schoolCol.details.staffs.staff.length;
          usrColIdx++
        ) {
          let userCol = schoolCol.details.staffs.staff[usrColIdx];

          if (
            user.name.first_name === userCol.name.first_name &&
            user.name.last_name === userCol.name.last_name &&
            user.users_dcid !== userCol.users_dcid
          ) {
            // This checks for an exact name match, while also ensuring the DCID
            // doesn't match to avoid a false positive on the original item.
            excludeList.push(user);
            console.log(
              `Adding ${user.name.first_name}, ${user.name.last_name} (${user.users_dcid}) to the exclude list`
            );
          }
        }
      }
    }
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

      // Lets first double check this user doesn't exist on an exclude list
      for (let i = 0; i < excludeList.length; i++) {
        if (
          user.name.first_name === excludeList[i].name.first_name &&
          user.name.last_name === excludeList[i].name.last_name &&
          user.users_dcid === excludeList[i].users_dcid
        ) {
          // This item exists on the exclude list and must be excluded.
          continue staffLoop;
        }
      }

      if (
        typeof user?.local_id === "string" &&
        user.local_id.startsWith("SVC-")
      ) {
        // Ignore Service Accounts
        continue;
      }

      // Now that we have our user data, and school data, we need to find
      // what most closely matches this user within AD
      // As well as properly handling if the DCID is already available.

      let extMatch = await adFindByAttribute(
        adData,
        user?.users_dcid,
        config.app.attribute
      );

      if (extMatch !== null) {
        successMatchesPS++;
        if (config.app.outputMatched) {
          changeTable.push(
            `DCID Matched: ${user?.users_dcid} to ${extMatch?.SamAccountName}; User OK!`
          );
        }
        foundSAMs.push(extMatch.SamAccountName);
        continue;
      }

      if (config.app?.checkEmployeeID) {
        // Then lets check in case the employeeID contains the right dcid
        let manExtMatch = await adFindByAttribute(
          adData,
          user?.users_dcid,
          "EmployeeID"
        );

        if (manExtMatch !== null) {
          successMatchesSecondaryPS++;
          if (config.app.outputMatched) {
            changeTable.push(
              `DCID Matched (employeeID): ${users?.users_dcid} to ${manExtMatch?.SamAccountName}; User OK!`
            );
          }
          foundSAMs.push(manExtMatch.SamAccountName);
          continue;
        }
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

    // First lets check if we have a defined extension to indicate we don't touch this item
    if (
      typeof user[config.app.attribute] === "string" &&
      user[config.app.attribute] === "ps2ad:no-sync"
    ) {
      noSyncAD++;
      if (config.app.outputIgnored) {
        changeTable.push(`Ignore: No Sync set on: ${user?.SamAccountName}`);
      }
      continue;
    }

    if (foundSAMs.includes(user?.SamAccountName)) {
      // This item is already accounted for within the earlier PowerSchool checks.
      // So we really don't need to do anything here at all, unless maybe log to
      // ensure this is known. But for now, just continue
      continue;
    }

    if (!user?.Enabled) {
      // The User has been disabled via AD, and can be ignored for now.
      disabledUserAD++;
      continue;
    }

    // Check if the user has the custom group membership
    if (
      Array.isArray(user.MemberOf) &&
      user.MemberOf.includes(config.app.group)
    ) {
      noSyncAD++;
      if (config.app.outputIgnored) {
        changeTable.push(
          `Ignore: Group Membership set on: ${user?.SamAccountName}`
        );
      }
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
