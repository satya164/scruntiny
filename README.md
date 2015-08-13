# Scrutiny

An async validator, inspired by ReactJS PropTypes.

## Installation
```sh
$ npm install pigment
```

## Usage
To use **scrutiny** in your projects, you need to require the node module first.

```javascript
var Scrutiny = require("scrutiny");
```

Scrutiny uses `checks` for validation, which are just simple functions. They can be asynchronous functions returning a promise or plain synchronous functions.

Validating values,
```javascript
var scrutiny = new Scrutiny();

scrutiny.validate(
    someval,
    scrutiny.checks.oneOfType([
        scrutiny.checks.string,
        scrutiny.checks.number
    ])
)
.catch(function(error) {
    // handle error
})
.then(function(value) {
    // do something with value
})
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
// Value is instance of a class, uses instanceof
scrutiny.checks.instanceOf(Class)

// Value is limited to specific values
scrutiny.checks.oneOf([ "apple", "banana" ])

// An object with property values of a certain type
scrutiny.checks.objectOf(scrutiny.checks.number)

// Value could be one of many types
scrutiny.checks.oneOfType([ scrutiny.checks.string, scrutiny.checks.number ])

// Value is not of the type
scrutiny.checks.notOfType(scrutiny.checks.array)

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
scrutiny.register("url", function(value) {
    if (!/^https?:\/\/.+\.[a-z]+$/.test(value)) {
        throw new Error("ERR_INVALID_URL");
    }
});

scrutiny.validate(somevar, scrutiny.checks.url)
.catch(/* handle error */)
.then(/* do something with value */)

// Async validator
scrutiny.register("username", function(value) {
    return new Promise(function(resolve, reject) {
        // query the server for the name

        if (exists) {
            reject(new Error("ERR_USERNAME_EXISTS"));
        } else {
            resolve();
        }
    });
});

scrutiny.validate(somevar, scrutiny.checks.username)
.catch(/* handle error */)
.then(/* do something with value */)
```

[![Build status](https://travis-ci.org/satya164/scrutiny.svg?branch=master)](https://travis-ci.org/satya164/scrutiny)
[![Dependencies](https://david-dm.org/satya164/scrutiny.svg)](https://david-dm.org/satya164/scrutiny)
[![License](https://img.shields.io/npm/l/scrutiny.svg)](http://opensource.org/licenses/mit-license.php)
