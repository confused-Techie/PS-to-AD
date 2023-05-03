/**
 * @file Easily exposes all rules for simple requires statements.
 */

const rules = {
  beforePS: [["duplicatePSUserCheck", require("./duplicatePSUserCheck.js")]],

  ps: [
    ["exclusionCheck", require("./exclusionCheck.js")],
    ["serviceAccountCheck", require("./serviceAccountCheck.js")],
    ["dcidMatch", require("./dcidMatch.js")],
    ["dcidMatchEmployeeID", require("./dcidMatchEmployeeID.js")],
    ["nameMatchCheck", require("./nameMatchCheck.js")],
  ],

  ad: [
    ["noSync", require("./noSyncCheck.js")],
    ["foundSAMsCheck", require("./foundSAMsCheck.js")],
    ["disabledCheck", require("./disabledCheck.js")],
    ["ignoreGroupCheck", require("./ignoreGroupCheck.js")],
  ],
};

module.exports = rules;

/**
 * Each rule should be given the following signature
 * - state: An object containing all relevant data
 * - adData: The Active Directory Working Data
 * - psData: The PowerSchool Working Data
 * - changeTable: The array all logged changes should be added to
 * - foundSAMS: Array of SAMS that have been found during PowerSchool Checks
 *   and should be ignored during Active Directory Checks
 * - excludeList: An array of objects to exclude
 * - successMatchesPS: Count of successful matches in PowerSchool
 * - successMatchesSecondaryPS: Count of successfull secondary matches in PowerSchool
 * - nameMatchPS: Count of name based PowerSchool Matches
 * - addedDCIDPS: Count of DCIDs added to users during PowerSchool Checks
 * - failedPS: Count of failed checks within PowerSchool
 * - noSyncAD: Count of users in some way set as no sync within AD
 * - disableUsersAD: Count of Disabled Users within AD
 * - failedAD: Count of checks failed within AD
 *
 * Then each function can optionall return a boolean. If this boolean is true,
 * then the rule will cause the loop to continue, and finish running the current iteration
 */
