const { describe, it } = require("node:test");
const assert = require("node:assert");

const compare = require("../src/integrations/compare.js");

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

    const config = {
      app: {
        verbose: true,
        skipPS: false,
        skipAD: false,
        noWrite: true,
        attribute: "extensionAttribute1",
      },
    };

    const res = await compare.compare(psData, adData, config);

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
  });
});
