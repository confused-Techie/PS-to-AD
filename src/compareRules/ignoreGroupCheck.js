function ignoreGroupCheck(user, state) {
  // Check if the user has the custom group membership
  if (Array.isArray(user.MemberOf) && user.MemberOf.includes(state.config.app.group)) {
    state.noSyncAD++;
    if (state.config.app.outputIgnored) {
      state.changeTable.push(`Ignore: Group Membership set on: ${user?.SamAccountName}`);
    }
    return true;
  } else {
    return false;
  }
}

module.exports = ignoreGroupCheck;
