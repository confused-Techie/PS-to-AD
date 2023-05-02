function noSync(user, state) {
  if (
    typeof user[state.config.app.atribute] === "string" &&
    user[state.config.app.attribute] === "ps2ad:no-sync"
  ) {
    state.noSync++;
    if (state.config.app.outputIgnored) {
      state.changeTable.push(`Ignore: No Sync set on: ${user?.SamAccountName}`);
    }
    return true;
  } else {
    return false;
  }
}

module.exports = noSync;
