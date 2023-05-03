function serviceAccountCheck(user, state) {
  if (typeof user?.local_id === "string" && user.local_id.startsWith("SVC-")) {
    return true;
  } else {
    return false;
  }
}

module.exports = serviceAccountCheck;
