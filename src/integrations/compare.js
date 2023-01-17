async function compare(config, args) {
  // The comparison function here needs to take the saved cached files of AD Data
  // and PS Data, and find the items that match up between them.

  // We won't try to optimize this to much, and instead focus on stability,
  // since PowerSchool is considered the Mast copy, we will loop through PS Data
  // while inumerating all data within AD to check for missing, or out of date information.

  // Additionally, we will look for a permenant identifier, to be able to continiously
  // use this
}

module.exports = {
  compare,
};
