## Modules

<dl>
<dt><a href="#module_activedirectory">activedirectory</a></dt>
<dd><p>Exposes the utilities to integrate with Active Directory</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#initial">initial(ps_data, ad_data, config)</a> ⇒ <code>object</code></dt>
<dd><p>This function is used during the initial migration only.
Essentially looping through both ways of the PS and AD data to identify
automatically whatever is possible, and for what fails to be automatically matched
will instead output to a file as needed.</p>
</dd>
<dt><a href="#adFindByFirstLast">adFindByFirstLast(ad_data, first, last)</a> ⇒ <code>object</code> | <code>null</code></dt>
<dd><p>Takes an Active Directory Data Object and iterates through it
until it is able to find a proper match to the first and last name provided.</p>
</dd>
</dl>

<a name="module_activedirectory"></a>

## activedirectory
Exposes the utilities to integrate with Active Directory


* [activedirectory](#module_activedirectory)
    * [~checkProcessStatus()](#module_activedirectory..checkProcessStatus) ⇒ <code>object</code>
    * [~getStaffList()](#module_activedirectory..getStaffList) ⇒ <code>string</code>

<a name="module_activedirectory..checkProcessStatus"></a>

### activedirectory~checkProcessStatus() ⇒ <code>object</code>
A currently unused function used to check if the current process running NodeJS is an admin.

**Kind**: inner method of [<code>activedirectory</code>](#module_activedirectory)  
**Returns**: <code>object</code> - A server status object where `ok` is true or false based on success.  
<a name="module_activedirectory..getStaffList"></a>

### activedirectory~getStaffList() ⇒ <code>string</code>
A function wrapping a promise that resolves after successfully running
the powershell command based on the configuration's script.

**Kind**: inner method of [<code>activedirectory</code>](#module_activedirectory)  
**Returns**: <code>string</code> - - ' Success'  
<a name="initial"></a>

## initial(ps_data, ad_data, config) ⇒ <code>object</code>
This function is used during the initial migration only.
Essentially looping through both ways of the PS and AD data to identify
automatically whatever is possible, and for what fails to be automatically matched
will instead output to a file as needed.

**Kind**: global function  
**Returns**: <code>object</code> - Will return a `change_table` an object structure of changes
waiting to take effect.  

| Param | Type | Description |
| --- | --- | --- |
| ps_data | <code>object</code> | The PowerSchool Data Object as read from disk. |
| ad_data | <code>object</code> | The ActiveDirectory Data Object as read from disk. |
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

