## Functions

<dl>
<dt><a href="#getConfig">getConfig(configLoc)</a> ⇒ <code>object</code></dt>
<dd><p>The main function that actually exports the configuration.</p>
</dd>
<dt><a href="#normalize">normalize(args, config)</a></dt>
<dd><p>This function takes the contents of the return for <code>getConfig</code> and the object
passed user config and will combine them into a single configuration.
Always prioritizing CLI parameters over Config File</p>
</dd>
<dt><a href="#setup">setup(args)</a></dt>
<dd><p>Handles the initial configuration setup. To where the main module
should only have to provide a configuration here and not worry about the rest
of the configuration validation.</p>
</dd>
<dt><a href="#run">run(args)</a> ⇒ <code>TBD</code></dt>
<dd><p>Like described in the top level module definition, this function is the
main handler to kick off the application lifetime.</p>
</dd>
<dt><a href="#handleActivedDirectoryData">handleActivedDirectoryData()</a> ⇒</dt>
<dd><p>A redirect and chained promise around functions exposed from
<code>activedirectory</code> to access get AD Data saved to disk.
On success the return is empty, otherwise throws error.</p>
</dd>
<dt><a href="#getStaffList">getStaffList()</a> ⇒ <code>string</code></dt>
<dd><p>A function wrapping a promise that resolves after successfully running
the powershell command based on the configuration&#39;s script.</p>
</dd>
<dt><a href="#compare">compare(psData, adData, config)</a> ⇒ <code>object</code></dt>
<dd><p>Compares data between both data sources to transform them as needed.</p>
</dd>
<dt><a href="#adFindByFirstLast">adFindByFirstLast(ad_data, first, last)</a> ⇒ <code>object</code> | <code>null</code></dt>
<dd><p>Takes an Active Directory Data Object and iterates through it
until it is able to find a proper match to the first and last name provided.</p>
</dd>
<dt><a href="#adFindByAttribute">adFindByAttribute(adData, ext, config)</a> ⇒ <code>object</code> | <code>null</code></dt>
<dd><p>Uses the configured attribute to search for match to the passed data field.</p>
</dd>
<dt><a href="#managePowerSchoolData">managePowerSchoolData()</a></dt>
<dd><p>Used to abstract away powerschool configurations and interactions from the main module</p>
</dd>
<dt><a href="#handlePowerSchoolData">handlePowerSchoolData(config)</a> ⇒ <code>string</code></dt>
<dd><p>This function is in charge of retreiving and saving up the date information
from PowerSchool. Which once done will be saved to the configured <code>cache</code></p>
</dd>
</dl>

<a name="getConfig"></a>

## getConfig(configLoc) ⇒ <code>object</code>
The main function that actually exports the configuration.

**Kind**: global function  
**Returns**: <code>object</code> - Returns the YAML Parsed file, or will error if no data is found.  

| Param | Type | Description |
| --- | --- | --- |
| configLoc | <code>string</code> | The user defined, or default file system location of the configuration file. |

<a name="normalize"></a>

## normalize(args, config)
This function takes the contents of the return for `getConfig` and the object
passed user config and will combine them into a single configuration.
Always prioritizing CLI parameters over Config File

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | The arguments from the CLI. |
| config | <code>object</code> | The configuration from the file system. |

<a name="setup"></a>

## setup(args)
Handles the initial configuration setup. To where the main module
should only have to provide a configuration here and not worry about the rest
of the configuration validation.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | The arguments from the CLI. |

<a name="run"></a>

## run(args) ⇒ <code>TBD</code>
Like described in the top level module definition, this function is the
main handler to kick off the application lifetime.

**Kind**: global function  
**Returns**: <code>TBD</code> - - TDB  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | The Arguments to pass to the entire application. Valid key value pairs described further in documentation. |

<a name="handleActivedDirectoryData"></a>

## handleActivedDirectoryData() ⇒
A redirect and chained promise around functions exposed from
`activedirectory` to access get AD Data saved to disk.
On success the return is empty, otherwise throws error.

**Kind**: global function  
**Returns**: - Empty set of data on success  
**Params**: <code>object</code> config - Our Config Object  
<a name="getStaffList"></a>

## getStaffList() ⇒ <code>string</code>
A function wrapping a promise that resolves after successfully running
the powershell command based on the configuration's script.

**Kind**: global function  
**Returns**: <code>string</code> - - ' Success'  
<a name="compare"></a>

## compare(psData, adData, config) ⇒ <code>object</code>
Compares data between both data sources to transform them as needed.

**Kind**: global function  
**Returns**: <code>object</code> - Will return a `change_table` an object structure of changes
waiting to take effect.  

| Param | Type | Description |
| --- | --- | --- |
| psData | <code>object</code> | The PowerSchool Data Object as read from disk. |
| adData | <code>object</code> | The ActiveDirectory Data Object as read from disk. |
| config | <code>object</code> | The normalized config |

<a name="adFindByFirstLast"></a>

## adFindByFirstLast(ad_data, first, last) ⇒ <code>object</code> \| <code>null</code>
Takes an Active Directory Data Object and iterates through it
until it is able to find a proper match to the first and last name provided.

**Kind**: global function  
**Returns**: <code>object</code> \| <code>null</code> - Returns either the properly indexed location for the entry
within the provided ad_data or will return `null`  

| Param | Type | Description |
| --- | --- | --- |
| ad_data | <code>object</code> | The ActiveDirectory Object as Read from Disk. |
| first | <code>string</code> | The First name to match |
| last | <code>string</code> | The Last Name to Match |

<a name="adFindByAttribute"></a>

## adFindByAttribute(adData, ext, config) ⇒ <code>object</code> \| <code>null</code>
Uses the configured attribute to search for match to the passed data field.

**Kind**: global function  
**Returns**: <code>object</code> \| <code>null</code> - AN object if the user is found, null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| adData | <code>object</code> | the active directory data passed. |
| ext | <code>string</code> | The value of the field we are matching against. |
| config | <code>object</code> | The configuration |

<a name="managePowerSchoolData"></a>

## managePowerSchoolData()
Used to abstract away powerschool configurations and interactions from the main module

**Kind**: global function  
<a name="handlePowerSchoolData"></a>

## handlePowerSchoolData(config) ⇒ <code>string</code>
This function is in charge of retreiving and saving up the date information
from PowerSchool. Which once done will be saved to the configured `cache`

**Kind**: global function  
**Returns**: <code>string</code> - - A Path to where the data has been written from PowerSchool.  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | = The configuration previously provided by `run()` with the same strucuted data. |

