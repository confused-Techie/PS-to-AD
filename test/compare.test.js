const { describe, it } = require("node:test");
const assert = require("node:assert");

const compare = require("../src/integrations/compare.js");

const testConfig = {
  app: {
    verbose: true,
    skipPS: false,
    skipAD: false,
    noWrite: true,
    attribute: "extensionAttribute1"
  }
};

describe("compare", () => {
  it("reports users who only exist in PowerSchool", async () => {
    const psData = [
      {
        details: {
          staffs: {
            staff: [
              {
                id: 2,
                local_id: 3,
                admin_username: "thedev",
                name: {
                  first_name: "The",
                  last_name: "Developer",
                },
                users_dcid: 4,
              },
            ],
          },
        },
      },
    ];

    const adData = [
      {
        GivenName: "t",
        Surname: "dev",
        SamAccountName: "testdev",
        Enabled: true,
      },
    ];

    const res = await compare.compare(psData, adData, testConfig);

    assert.equal(
      res[0],
      "Not Found: (PowerSchool -> Active Directory) The, Developer; DCID: 4; Teacher Number: 3"
    );
  });

  it("reports users who only exist in Active Directory", async () => {
    const psData = [
      {
        details: {
          staffs: {
            staff: [
              {
                local_id: 3,
                admin_username: "thedev",
                name: {
                  first_name: "The",
                  last_name: "Developer",
                },
                users_dcid: 4,
              },
            ],
          },
        },
      },
    ];

    const adData = [
      {
        GivenName: "The",
        Surname: "Developer",
        SamAccountName: "thDeveloper",
        Enabled: true
      },
      {
        GivenName: "Idont",
        Surname: "existInPS",
        SamAccountName: "idexistInPS",
        Enabled: true
      }
    ];

    const res = await compare.compare(psData, adData, testConfig);

    assert.equal(
      res[0],
      "Add DCID: 4 to thDeveloper"
    );

    assert.equal(
      res[1],
      "Not Found: (Active Directory -> PowerSchool) Idont, existInPS; idexistInPS; last Logon Timestamp: undefined"
    );

  });
});
