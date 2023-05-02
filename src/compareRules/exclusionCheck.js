function exclusionCheck(user, state) {
  let shouldContinue = false;

  // Lets check if the user doesn't exist on an exclude list
  for (let i = 0; i < state.excludeList.length; i++) {
    if (
      user.name.first_name === state.excludeList[i].name.first_name &&
      user.name.last_name === state.excludeList[i].name.last_name &&
      user.users_dcid === state.excludeList[i].users_dcid
    ) {
      // This item exists on the exclude list and must be excluded
      shouldContinue = true;
    }
  }
  return shouldContinue;
}

module.exports = exclusionCheck;
