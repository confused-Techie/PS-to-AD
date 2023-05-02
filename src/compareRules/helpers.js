/**
 * @async
 * @function adFindByFirstLast
 * @desc Takes an Active Directory Data Object and iterates through it
 * until it is able to find a proper match to the first and last name provided.
 * @param {object} ad_data - The ActiveDirectory Object as Read from Disk.
 * @param {string} first - The First name to match
 * @param {string} last - The Last Name to Match
 * @returns {object|null} Returns either the properly indexed location for the entry
 * within the provided ad_data or will return `null`
 */
async function adFindByFirstLast(adData, first, last) {
  for (let i = 0; i < adData.length; i++) {
    if (
      adData[i]["GivenName"].toLowerCase() === first.toLowerCase() &&
      adData[i]["Surname"].toLowerCase() === last.toLowerCase()
    ) {
      return adData[i];
    }
  }
  return null;
}

/**
 * @async
 * @function adFindByAttribute
 * @desc Uses the configured attribute to search for match to the passed data field.
 * @param {object} adData - the active directory data passed.
 * @param {string} ext - The value of the field we are matching against.
 * @param {object} config - The configuration
 * @return {object|null} AN object if the user is found, null otherwise
 */
async function adFindByAttribute(adData, ext, attr) {
  for (let i = 0; i < adData.length; i++) {
    let attrib = parseInt(adData[i][attr]);

    if (attrib === ext) {
      return adData[i];
    }
  }
  return null;
}

module.exports = {
  adFindByFirstLast,
  adFindByAttribute,
};
