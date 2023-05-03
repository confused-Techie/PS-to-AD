/**
 * @function duplicatePSUserCheck
 * @desc This check is used to determine if there are any similar enough
 * duplicated users within PowerSchool. Really checking if users have the same
 * first and last names exactly. If any user is marked as having the same
 * first and last name, then both users will be added to the ignore list
 * to ensure no incorrect matches occur on that user.
 */
function duplicatePSUserCheck(state) {
  // Due to the rare possibility of a user havng an identical first and last name
  // in PowerSchool we will firstly do a check for this happening, then ensure
  // to ignore them from all future checks and emit a warning.
  for (let schoolIdx = 0; schoolIdx < state.psData.length; schoolIdx++) {
    let school = state.psData[schoolIdx];

    for (
      let usrIdx = 0;
      usrIdx < school.details.staffs.staff.length;
      usrIdx++
    ) {
      let user = school.details.staffs.staff[usrIdx];

      // Now with our single user, we will do another loop through every single
      // other user and ensure we don't have any collisions

      for (
        let schoolColIdx = 0;
        schoolColIdx < state.psData.length;
        schoolColIdx++
      ) {
        let schoolCol = state.psData[schoolColIdx];

        for (
          let usrColIdx = 0;
          usrColIdx < schoolCol.details.staffs.staff.length;
          usrColIdx++
        ) {
          let userCol = schoolCol.details.staffs.staff[usrColIdx];

          if (
            user.name.first_name === userCol.name.first_name &&
            user.name.last_name === userCol.name.last_name &&
            user.users_dcid !== userCol.users_dcid
          ) {
            // Checks for an exact name match, while also ensuring the DCID
            // doesn't match to avoid a false positive on the origial user

            state.excludeList.push(user);
            console.log(
              `Adding ${user.name.first_name}, ${user.name.last_name} (${user.users_dcid}) to the exclude list.`
            );
          }
        }
      }
    }
  }

  return;
}

module.exports = duplicatePSUserCheck;
