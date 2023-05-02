function foundSAMsCheck(user, state) {
  if (state.foundSAMs.includes(user?.SamAccountName)) {
    // This item is already accounted for within the earlier PowerSchool checks.
    // So we really don't need to do anything here at all, unless maybe log to
    // ensure this is known. But for now, just continue
    return true;
  } else {
    return false;
  }
}

module.exports = foundSAMsCheck;
