/**
 * @file This contains the functions used for comparison and matching.
 */

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
  let goodMatch = 0;
  let badMatch = 0;

  // So lets write this as the only method and cross my damn fingers
  // Assuming we remove support for multiple algo options, and only use the 'recursive'
  for (let schoolIdx = 0; schoolIdx < psData.length; schoolIdx++) {
    let school = psData[schoolIdx];

    for (
      let usrIdx = 0;
      usrIdx < school.details.staffs.staff.length;
      usrIdx++
    ) {
      let user = school.details.staffs.staff[usrIdx];

      // Now that we have our user data, and school data, we need to find
      // what most closely matches this user within AD
      // As well as properly handling if the DCID is already available.

      let extMatch = await adFindByAttribute(adData, user?.users_dcid, config);

      if (extMatch !== null) {
        goodMatch++;
        changeTable.push(
          `DCID Matched: ${user?.users_dcid} to ${extMatch?.SamAccountName}; User OK!`
        );
        foundSAMs.push(extMatch.SamAccountName);
        continue;
      }

      // Our DCID didn't match, so lets check by name
      let nameMatch = await adFindByFirstLast(
        adData,
        user?.name?.first_name,
        user?.name?.last_name
      );

      if (nameMatch !== null) {
        goodMatch++;
        changeTable.push(
          `Add DCID: ${user?.users_dcid} to ${nameMatch.SamAccountName}`
        );
        foundSAMs.push(nameMatch.SamAccountName);
        continue;
      }

      // We couldn't find the user by DCID or by name. We could keep trying, but for now lets mark error
      badMatch++;
      changeTable.push(
        `Not Found: (PowerSchool -> Active Directory) ${user?.name?.first_name}, ${user?.name?.last_name}; DCID: ${user?.users_dcid}; Teacher Number: ${user?.local_id}`
      );
    }
  }

  console.log(
    `Successful Matches: ${goodMatch} -- Unsuccessful Matches: ${badMatch} -- Total AD Unmatched: ${
      adData.length - goodMatch
    }`
  );

  // Now that we have properly matched all users in powerschool, we still have to consider AD users.
  // But since powerschool is the master copy this will have to be done differently.
  for (let usrIdx = 0; usrIdx < adData.length; usrIdx++) {
    let user = adData[usrIdx];

    // First lets check if we have a defined extension to indicate we don't touch this item
    if (
      typeof user[config.app.attribute] === "string" &&
      user[config.app.attribute] === "ps2ad:no-sync"
    ) {
      goodMatch++;
      changeTable.push(`Ignore: No Sync set on: ${user?.SamAccountName}`);
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
      continue;
    }

    // Which since PowerSchool is the master copy, in the future the resulting
    // items here may be up for deletion. For now though lets log nicely
    badMatch++;
    changeTable.push(
      `Not Found: (Active Directory -> PowerSchool) ${user?.GivenName}, ${user?.Surname}; ${user?.SamAccountName}`
    );
  }

  console.log(
    `Successful Matches: ${goodMatch} -- Unsuccessful Matches: ${badMatch} -- Unhandled AD Items: ${
      adData.length - (goodMatch + badMatch)
    }`
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
async function adFindByAttribute(adData, ext, config) {
  for (let i = 0; i < adData.length; i++) {
    if (adData[i][config.app.attribute] === ext) {
      return adData[i];
    }
  }
  return null;
}

module.exports = {
  compare,
};
