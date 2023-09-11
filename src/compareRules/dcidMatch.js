const helper = require("./helpers.js");

async function dcidMatch(user, state) {
  // Now that we have our user data, and school data, we need to find
  // what most closely matches this user within AD
  // As well as properly handling if the DCID is already available.

  let extMatch = await helper.adFindByAttribute(
    state.adData,
    user?.users_dcid,
    state.config.app.attribute
  );

  if (extMatch !== null) {
    state.matchedDCID++;

    if (state.config.app.outputMatched) {
      state.changeTable.push(
        `DCID Matched: ${user?.users_dcid} to ${extMatch?.SamAccountName}; User OK!`
      );
    }
    state.foundSAMs.push(extMatch.SamAccountName);
    return true;
  } else {
    return false;
  }
}

module.exports = dcidMatch;
