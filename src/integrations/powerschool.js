/**
 * @file Contains the functions used for interacting directly with PowerSchool.
 */

const axios = require("axios");
const fs = require("fs");
const log = require("log-utils");

/**
 * @function managePowerSchoolData
 * @desc Used to abstract away powerschool configurations and interactions from the main module
 */
async function managePowerSchoolData(config) {
  if (config.app.skipPS) {
    // We are skipping external calls, get cached data

    let data = JSON.parse(
      fs.readFileSync(`${config.app.cachePath}/ps_data.json`, {
        encoding: "utf8",
      })
    );

    console.log("`skipPS` Set! Skipping Powerschool data retreival...");

    return data;
  } else {
    // We are in fact getting remote powerschool data

    let psDataLoc = await handlePowerSchoolData(config);

    // handlePowerSchoolData returns the location of the data on disk.

    let data = JSON.parse(fs.readFileSync(psDataLoc, { encoding: "utf8" }));

    console.log("Successfully retreived powerschool data.");

    return data;
  }
}

/**
 * @function handlePowerSchoolData
 * @desc This function is in charge of retreiving and saving up the date information
 * from PowerSchool. Which once done will be saved to the configured `cache`
 * @param {object} config = The configuration previously provided by `run()`
 * with the same strucuted data.
 * @returns {string} - A Path to where the data has been written from PowerSchool.
 */
async function handlePowerSchoolData(config) {
  // Now lets make sure we have the credentials needed for powerschool and that
  // they can be transformed successfully.

  if (
    typeof config.server.id !== "string" ||
    typeof config.server.secret !== "string" ||
    typeof config.server.url !== "string"
  ) {
    console.log(
      `${log.error} - Failed to confirm type validity of PowerSchool ID, Secret, or URL`
    );

    if (config.app.verbose) {
      console.log(
        `${
          typeof config.server.id !== "string" ? log.error : log.success
        } [${typeof config.server.id}] - Server ID: ${config.server.id}`
      );
      console.log(
        `${
          typeof config.server.secret !== "string" ? log.error : log.success
        } [${typeof config.server.secret}] - Server Secret: ${
          config.server.secret
        }`
      );
      console.log(
        `${
          typeof config.server.url !== "string" ? log.error : log.success
        } [${typeof config.server.url}] - Server URL: ${config.server.url}`
      );
    }

    throw new Error("Powerschool ID, Secret, URL invalid type");
    process.exit(1);
  }

  let psAuth = await powerschoolCreds(
    config.server.id,
    config.server.secret,
    config.server.url
  );
  console.log(log.ok("- Successfully retreived Access Token from PowerSchool"));

  if (psAuth === undefined) {
    // ps_auth is initialized as undefined within our integration, so we check
    // explicitly for it
    console.log(
      `${log.error} - Was unable to retreive actual Access Token Value from PowerSchool`
    );
    process.exit(1);
  }

  if (config.app.verbose) {
    console.log(log.ok(`- PowerSchool Access Token: ${psAuth}`));
  }

  // Now with our token, it's time to get the powerschool staff data

  if (config.app.verbose) {
    console.log(log.heading("Retreive Data from PowerSchool"));
  }

  let psData = await getStaffList(config.schools, config.server.url, psAuth);

  console.log(log.ok("- Successfully Collected Data from PowerSchool"));

  // Now lets save the data to disk, to ensure we don't need to request again
  // unless needed.
  fs.writeFileSync(
    `${config.app.cachePath}/ps_data.json`,
    JSON.stringify(psData, null, 2),
    { encoding: "utf8" }
  );
  console.log(log.ok("- Successfully Cached PowerSchool Data"));

  return `${config.app.cachePath}/ps_data.json`;
}

async function getStaffList(schoolArray, url, accessToken) {
  let districtArray = [];

  for await (const school of schoolArray) {
    let schoolName = typeof school.name === "string" ? school.name : school.id;

    let staffCount, staffDetails;

    try {
      staffCount = await axios({
        method: "get",
        url: `${url}/ws/v1/school/${school.id}/staff/count`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      throw err;
    }

    try {
      staffDetails = await axios({
        method: "get",
        url: `${url}/ws/v1/school/${school.id}/staff?expansions=emails,addresses,phones,school_affiliations&extensions=u_dyn_schoolstaff_1,u_schoolstaffuserfields`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      // Unfortunatly there are now pagination values to check, except the knowledge that
      // if staffCount.data.resource.count > 100
      // then items are paginated to another page

      if (staffCount.data.resource.count > 100) {
        let pageLoops = 0;
        let pageToCheck = 2;
        let totalCount = staffCount.data.resource.count;

        while (totalCount - pageLoops * 100 > 100) {
          let moreStaffDetails = await axios({
            method: "get",
            url: `${url}/ws/v1/school/${school.id}/staff?expansions=emails,addresses,phones,school_affiliations&extensions=u_dyn_schoolstaff_1,u_schoolstaffuserfields&page=${pageToCheck}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          });

          staffDetails.data.staffs.staff =
            staffDetails.data.staffs.staff.concat(
              moreStaffDetails.data.staffs.staff
            );

          pageLoops = pageLoops + 1;
          pageToCheck = pageToCheck + 1;
        }
      }
    } catch (err) {
      throw err;
    }

    districtArray.push({
      details: staffDetails.data,
      count: staffCount.data.resource.count,
      schoolName: schoolName,
      schoolID: school.id,
    });
  }
  return districtArray;
}

async function powerschoolCreds(id, secret, url) {
  let credentials = new Buffer(`${id}:${secret}`).toString("base64");

  const urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");

  let accessToken = undefined;

  try {
    let resp = await axios.post(`${url}/oauth/access_token`, urlencoded, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Authorization: `Basic ${credentials}`,
      },
    });

    accessToken = resp.data.access_token;
    // TODO: Rebuild these safety nets properly to ensure they still work.
    //access_token = resp?.data?.access_token;

    // Then to ensure our nullish accepting object read doesn't enter a bad value.
    //if (!Object.hasOwn(resp.data) || !Object.hasOwn(resp?.data.access_token)) {
    //  access_token = undefined;
    //}

    return accessToken;
  } catch (err) {
    throw err;
  }

  return accessToken;
}

module.exports = {
  powerschoolCreds,
  getStaffList,
  managePowerSchoolData,
};
