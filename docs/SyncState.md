# SyncState

The title of the document being of double meaning, not only documenting the state object used during the actual sync process, but also documenting the syncing state information itself that's returned eventually.

So far, important information about sync behavior has been limited not only to the console, but of only a few lines resulting in logged data like so:

```
PowerSchool Stats:
DCID Already Present: 333 - DCID in EmployeeID: 0 - Name Successfully Matched: 46 - Added DCID: 0 - No Mach: 7
Active Directory Stats:
NoSync Set: 19 - Disabled Account: 59 - Failed to Match: 90
```

While this is fine and dandy for manual runs, this data needs to be much more consumable for automated emails, or for reviewing log files later on, especially considering output data is saved by default.

To account for this, lets redesign all values used to track state within the system, and avoid nonsense like `failedPS`, because failed how?

## States to Track

* matchedDCID: Indicates that a user in Active Directory already has their DCID from PowerSchool added.
* notFoundPS_AD: A user wasn't found when searching from PowerSchool -> Active Directory. Meaning a user that exists in PowerSchool, couldn't be located via any known means within Active Directory
* notFoundAD_PS: The exact opposite of notFoundPS_AD, a user provided by Active Directory couldn't be correlated to any user within PowerSchool.
