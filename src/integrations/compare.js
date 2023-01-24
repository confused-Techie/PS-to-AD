/**
 * @file This contains the functions used for comparison and matching.
 */

async function compare(config, args) {
  // The comparison function here needs to take the saved cached files of AD Data
  // and PS Data, and find the items that match up between them.
  // We won't try to optimize this to much, and instead focus on stability,
  // since PowerSchool is considered the Mast copy, we will loop through PS Data
  // while inumerating all data within AD to check for missing, or out of date information.
  // Additionally, we will look for a permenant identifier, to be able to continiously
  // use this
}

/**
 * @function initial
 * @async
 * @desc This function is used during the initial migration only.
 * Essentially looping through both ways of the PS and AD data to identify
 * automatically whatever is possible, and for what fails to be automatically matched
 * will instead output to a file as needed.
 * @param {object} ps_data - The PowerSchool Data Object as read from disk.
 * @param {object} ad_data - The ActiveDirectory Data Object as read from disk.
 * @param {object} config - The normalized config
 * @returns {object} Will return a `change_table` an object structure of changes
 * waiting to take effect.
 */
async function initial(ps_data, ad_data, config) {
  // This function is used during the initial migration.
  // Needs to be able to dynamically check the data for any potential matches.

  let METHOD = null; // fill with default

  let change_table = []; // The variable to collect the change status information
  let goodMatch = 0;
  let badMatch = 0; // testing vars

  if (config.app?.algo) {
    // this checks that either on is Truthy, or otherwise has any value
    METHOD = config.app.algo;
  }

  switch (METHOD) {
    case "recursive":
    default:
      // The default or recursive Method will be the simpliest
      // but possibly the longest. Sorting linearly through the data

      for (let schoolIdx = 0; schoolIdx < ps_data.length; schoolIdx++) {
        let school = ps_data[schoolIdx];
        for (
          let usrIdx = 0;
          usrIdx < school.details.staffs.staff.length;
          usrIdx++
        ) {
          let user = school.details.staffs.staff[usrIdx];

          // Now that we have our user data, and school data, we need to find
          // what most closely matches this user within AD
          // Lets first check for the simpliest format.

          // Even though the email is the simpliest on AD, in PS it's very optional

          let username =
            user?.emails?.work_email ??
            user?.teacher_username ??
            user?.admin_username ??
            `${user?.name?.first_name.substring(0, 2)}${user?.name?.last_name}`;

          // Since we know we are looking for a SAM in a moment, which will not include any email domains.
          // Lets optionally take a domain from our config to trunicate.
          if (typeof config.app?.domain === "string") {
            // Since a domain is set, lets see if it's within our username,
            //and trunicate prior to usage for sam lookup.

            if (username.endsWith(config.app.domain)) {
              username = username.replace(config.app.domain, "");
              username = username.replace("@", "");
            }
          }

          let nameMatch = await adFindByFirstLast(
            ad_data,
            user?.name?.first_name,
            user?.name?.last_name
          );

          if (nameMatch === null) {
            badMatch++;
            change_table.push(
              `Not Found: ${user?.name?.first_name}, ${user?.name?.last_name}`
            );
          } else {
            goodMatch++;
          }
        }
      }
  }
  console.log(
    `Successful Matches: ${goodMatch} -- Unsuccessful Matches: ${badMatch}`
  );
  return change_table;
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
async function adFindByFirstLast(ad_data, first, last) {
  for (let i = 0; i < ad_data.length; i++) {
    if (
      ad_data[i]["GivenName"].toLowerCase() === first.toLowerCase() &&
      ad_data[i]["Surname"].toLowerCase() === last.toLowerCase()
    ) {
      return ad_data[i];
    }
  }
  return null;
}

module.exports = {
  compare,
  initial,
};
