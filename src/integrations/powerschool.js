const axios = require("axios");

async function getStaffList(schoolArray, url, access_token) {
  let districtArray = [];

  for await (const school of schoolArray) {
    let schoolName = typeof school.name === "string" ? school.name : school.id;

    let staffCount, staffDetails;

    try {
      staffCount = await axios({
        method: "get",
        url: `${url}/ws/v1/school/${school.id}/staff/count`,
        headers: {
          Authorization: `Bearer ${access_token}`,
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
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      });
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

  let access_token = undefined;

  try {
    let resp = await axios.post(`${url}/oauth/access_token`, urlencoded, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Authorization: `Basic ${credentials}`,
      },
    });

    access_token = resp.data.access_token;
    // TODO: Rebuild these safety nets properly to ensure they still work.
    //access_token = resp?.data?.access_token;

    // Then to ensure our nullish accepting object read doesn't enter a bad value.
    //if (!Object.hasOwn(resp.data) || !Object.hasOwn(resp?.data.access_token)) {
    //  access_token = undefined;
    //}

    return access_token;
  } catch (err) {
    throw err;
  }

  return access_token;
}

module.exports = {
  powerschoolCreds,
  getStaffList,
};
