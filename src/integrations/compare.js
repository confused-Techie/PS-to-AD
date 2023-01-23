async function compare(config, args) {
  // The comparison function here needs to take the saved cached files of AD Data
  // and PS Data, and find the items that match up between them.
  // We won't try to optimize this to much, and instead focus on stability,
  // since PowerSchool is considered the Mast copy, we will loop through PS Data
  // while inumerating all data within AD to check for missing, or out of date information.
  // Additionally, we will look for a permenant identifier, to be able to continiously
  // use this
}

async function initial(ps_data, ad_data, args, config) {
  // This function is used during the initial migration.
  // Needs to be able to dynamically check the data for any potential matches.

  let METHOD = null; // fill with default

  let change_table = []; // The variable to collect the change status information
  let goodMatch = 0;
  let badMatch = 0; // testing vars

  if (args.algo || config.app.algo) {
    // this checks that either on is Truthy, or otherwise has any value
    METHOD = args.algo ?? config.app.algo;
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
          if (
            typeof config.app.domain === "string" ||
            typeof args.domain === "string"
          ) {
            // Since a domain is set, lets see if it's within our username, and trunicate prior to usage for sam lookup.
            //console.log(`Username: ${username} - Check: ${username.endsWith("@beardsley.k12.ca.us")} - True Check: ${username.endsWith(config.app.domain ?? args.domain)}`);
            if (username.endsWith(config.app.domain ?? args.domain)) {
              username = username.replace(config.app.domain ?? args.domain, "");
              username = username.replace("@", "");
            }
          }

          // let usernameMatch = await adFindBySAM(ad_data, username);

          // if (usernameMatch === null) {
          // We failed to find a match for this user. Lets log
          // change_table.push({
          // status: false,
          // msg: `Unable to locate: ${user?.name.first_name} ${user?.name.last_name} under ${username} within AD. School: ${school.schoolName}`
          // });
          // continue;
          // }
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

async function adFindBySAM(ad_data, sam) {
  // This simple utility function can search ad_data for a SAM matching the string provided.
  for (let i = 0; i < ad_data.length; i++) {
    if (ad_data[i]["SamAccountName"].toLowerCase() === sam.toLowerCase()) {
      return ad_data[i];
    }
  }
  return null;
}

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
