## Modules

<dl>
<dt><a href="#module_conifg">conifg</a></dt>
<dd><p>This module exports utilities helpful for finding and managing the application
configuration.</p>
</dd>
<dt><a href="#module_main">main</a></dt>
<dd><p>This is invoked by <code>./bin/ps2ad.js</code> or by requirng the main module from another.
Which will export the function <code>run</code> to be called to kick off our script process.</p>
</dd>
</dl>

<a name="module_conifg"></a>

## conifg
This module exports utilities helpful for finding and managing the application
configuration.


* [conifg](#module_conifg)
    * [~getConfig(configLoc)](#module_conifg..getConfig) ⇒ <code>object</code>
    * [~normalize(args, config)](#module_conifg..normalize)

<a name="module_conifg..getConfig"></a>

### conifg~getConfig(configLoc) ⇒ <code>object</code>
The main function that actually exports the configuration.

**Kind**: inner method of [<code>conifg</code>](#module_conifg)  
**Returns**: <code>object</code> - Returns the YAML Parsed file, or will error if no data is found.  

| Param | Type | Description |
| --- | --- | --- |
| configLoc | <code>string</code> | The user defined, or default file system location of the configuration file. |

<a name="module_conifg..normalize"></a>

### conifg~normalize(args, config)
This function takes the contents of the return for `getConfig` and the object
passed user config and will combine them into a single configuration.
Always prioritizing CLI parameters over Config File

**Kind**: inner method of [<code>conifg</code>](#module_conifg)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | The arguments from the CLI. |
| config | <code>object</code> | The configuration from the file system. |

<a name="module_main"></a>

## main
This is invoked by `./bin/ps2ad.js` or by requirng the main module from another.
Which will export the function `run` to be called to kick off our script process.


* [main](#module_main)
    * [~run(args)](#module_main..run) ⇒ <code>TBD</code>
    * [~setupPowerSchool(config)](#module_main..setupPowerSchool) ⇒ <code>string</code>
    * [~setupAD()](#module_main..setupAD) ⇒

<a name="module_main..run"></a>

### main~run(args) ⇒ <code>TBD</code>
Like described in the top level module definition, this function is the
main handler to kick off the application lifetime.

**Kind**: inner method of [<code>main</code>](#module_main)  
**Returns**: <code>TBD</code> - - TDB  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | The Arguments to pass to the entire application. Valid key value pairs described further in documentation. |

<a name="module_main..setupPowerSchool"></a>

### main~setupPowerSchool(config) ⇒ <code>string</code>
This function is in charge of retreiving and saving up to date information
from PowerSchool. Which once done will be saved to the configured `cache`

**Kind**: inner method of [<code>main</code>](#module_main)  
**Returns**: <code>string</code> - - A Path the where the data has been written from PowerSchool.  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration previously provided by `run()` with the same structured data. |

<a name="module_main..setupAD"></a>

### main~setupAD() ⇒
A redirect and chained promise around functions exposed from `activedirectory`
to access get AD Data saved to disk. On success the return is empty, otherwise throws error.

**Kind**: inner method of [<code>main</code>](#module_main)  
**Returns**: - Empty set of data on success  
**Params**: <code>object</code> config - Our Config Object  
