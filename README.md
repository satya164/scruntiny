# Scrutiny

An async validator, inspired by ReactJS PropTypes.

[![Build status](https://travis-ci.org/satya164/scrutiny.svg?branch=master)](https://travis-ci.org/satya164/scrutiny)
[![Dependencies](https://david-dm.org/satya164/scrutiny.svg)](https://david-dm.org/satya164/scrutiny)
[![License](https://img.shields.io/npm/l/scrutiny.svg)](http://opensource.org/licenses/mit-license.php)

## Installation
```sh
$ npm install scrutiny
```

## Requirements
Scrutiny has a `Promise` based API, and needs a global `Promise` object to function. Promises are natively available from Node.js v0.11 onwards.

If you don't have a global `Promise` object, you can alternatively use `bluebird`, `Q` or any Promises/A+ compliant promise library as follows,

```javascript
Scrutiny.setPromise(require("bluebird"));
```

## Usage
To use **scrutiny** in your projects, you need to require the node module first.

```javascript
var Scrutiny = require("scrutiny");
```

Scrutiny uses `checks` for validation, which are just simple functions. They can be asynchronous functions returning a promise, or plain synchronous functions.

Validating values,
```javascript
var scrutiny = new Scrutiny();

scrutiny.validate(
    someValue,
    scrutiny.checks.oneOfType([
        scrutiny.checks.string,
        scrutiny.checks.number,
        scrutiny.checks.shape({
            toString: scrutiny.checks.func
        })
    ])
)
.catch(function(error) {
    // handle error
})
.then(function(value) {
    // do something with value
});
```

### Inbuilt checks
```javascript
scrutiny.checks.any            // matches anything
scrutiny.checks.undef          // matches undefined using typeof
scrutiny.checks.string         // matches strings using typeof
scrutiny.checks.bool           // matches booleans using typeof
scrutiny.checks.number         // matches numbers, doesn't match NaN
scrutiny.checks.func           // matches functions using typeof
scrutiny.checks.array          // matches arrays using Array.isArray
scrutiny.checks.object         // matches objects, doesn't match null
```

### Inbuilt helpers
```javascript
// Value is limited to specific values
scrutiny.checks.oneOf([ "apple", "banana" ])

// An object with property values of a certain type
scrutiny.checks.objectOf(scrutiny.checks.number)

// Value could be one of many types
scrutiny.checks.oneOfType([ scrutiny.checks.string, scrutiny.checks.number ])

// An object taking on a particular shape
scrutiny.checks.shape({
    name: scrutiny.checks.string,
    salary: scrutiny.checks.number
})
```


## Custom checks
Scrutiny is not of much use without custom checks. Adding your own custom checks are easy.

Checks can be of 2 types, synchronous or asynchronous. Synchronous checks can throw errors if check failed, and asynchronous checks can return a promise which resolves if check passed, and rejects with error if check failed.

```javascript
var scrutiny = new Scrutiny();

// Synchronous validator
scrutiny.register("email", function(value) {
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]+$/.test(value)) {
        throw new Error("ERR_INVALID_EMAIL");
    }
});

// Async validator
scrutiny.register("unique", function(value) {
    return new Promise(function(resolve, reject) {
        // query the server for the email

        if (exists) {
            reject(new Error("ERR_EMAIL_EXISTS"));
        } else {
            resolve();
        }
    });
});

scrutiny.validate(emailId, scrutiny.checks.email, scrutiny.checks.unique)
.catch(/* handle error */)
.then(/* do something with value */)
```

## Source code

You can get the latest source code from the [github page](http://github.com/satya164/scrutiny).

`git clone https://github.com/satya164/scrutiny.git`

## Bugs and feature requests

Please submit bugs and feature requests [here](http://github.com/satya164/scrutiny/issues). Pull requests are always welcome.
