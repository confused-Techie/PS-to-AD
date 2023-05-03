const helper = require("./helpers.js");
const rules = require("../integrations/activedirectory.js");

async function nameMatchCheck(user, state) {
  // Let's try and match only by name
  let nameMatch = await helper.adFindByFirstLast(
    state.adData,
    user?.name?.first_name,
    user?.name?.last_name
  );

  if (nameMatch !== null) {
    if (state.config.app.noWrite) {
      state.nameMatchPS++;
      state.changeTable.push(
        `Add DCID: ${user?.users_dcid} to ${nameMatch.SamAccountName}`
      );
      state.foundSAMs.push(nameMatch.SamAccountName);
      return true;
    } else {
      // We should write our changes
      let ret = await activedirectory.addAttribToUser(
        nameMatch.SamAccountName,
        user.users_dcid,
        state.config
      );
      state.nameMatchPS++;
      state.addedDCIDPS++;
      state.changeTable.push(
        `Successfully Added- DCID: ${user.users_dcid} to ${nameMatch.SamAccountName}`
      );
      state.foundSAMs.push(nameMatch.SamAccountName);
      return true;
    }
  }
}

module.exports = nameMatchCheck;
