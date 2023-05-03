function disabledCheck(user, state) {
  if (!user?.Enabled) {
    // The User has been disabled via AD, and can be ignored for now.
    state.disabledUserAD++;
    return true;
  }
}

module.exports = disabledCheck;
