function noSync(user, state) {
  if (
    typeof user[state.config.app.attribute] === "string" &&
    user[state.config.app.attribute] === "ps2ad:no-sync"
  ) {
    state.noSyncAD++;
    if (state.config.app.outputIgnored) {
      state.changeTable.push(`Ignore: No Sync set on: ${user?.SamAccountName}`);
    }
    return true;
  }
}

module.exports = noSync;
