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
Scrutiny has a `Promise` based API, and needs a global `Promise` object to function. Promises are natively available from `Node.js v0.11.13` onwards.

If you don't have a global `Promise` object, or don't want to rely on the native implementation (which is known to be slow), you can alternatively specify `bluebird`, `Q` or any Promises/A+ compliant promise library to use,

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
.then(function(value) {
    // do something with the value
})
.catch(function(error) {
    if (error instanceof Scrutiny.Error) {
        // handle error in validation
    } else {
        // handle other errors
    }
});
```

When an error occurs, all the inbuilt checks return an instance of `Scrutiny.Error`, so you can verify that the `Error` was in fact a validation error, and not some other error.

**Tip:** You can check if an error is `Scrutiny.Error` either with `instanceof` or the `name` property of the error object.

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
        throw new Scrutiny.Error("'" + value + "' is not a valid email address");
    }
});

// Async validator
scrutiny.register("unique", function(value) {
    return new Promise(function(resolve, reject) {
        // query database for uniqueness of email

        if (exists) {
            reject(new Scrutiny.Error("'" + value + "' already exists"));
        } else {
            resolve();
        }
    });
});

scrutiny.validate(emailId, scrutiny.checks.email, scrutiny.checks.unique)
.then(/* do something with value */)
.catch(/* handle error */);
```

While you can just throw/reject with plain `Error` objects in `checks`, it's highly recommended that you throw `Scrutiny.Error` instead, so that errors which aren't validation errors don't go unnoticed.

## Custom helpers
Helpers are functions which take some parameters and return a `check`. Useful when you want to pass some parameters to your checks.

```javascript
scrutiny.register("instanceOf", function(instance) {
    return function(value) {
        if (value instanceof instance === false) {
            throw new Scrutiny.Error("'" + value + "' is not an instance of " + instance);
        }
    };
});

scrutiny.validate(new Error(), scrutiny.checks.instanceOf(Error))
.then(/* do something with value */)
.catch(/* handle error */);
```

## Using with ES2016 `async` functions

Scrutiny works great with ES2016 `async`/`await` syntax, and the code becomes a lot more simpler.

```javascript
try {
    await scrutiny.validate(
        input,
        scrutiny.checks.username
    );

    // do something with the input value
} catch (error) {
    if (error instanceof Scrutiny.Error) {
        // handle error in validation
    } else {
        // handle other errors
    }
}
```

## Source code

You can get the latest source code from the [github page](http://github.com/satya164/scrutiny).

`git clone https://github.com/satya164/scrutiny.git`

## Bugs and feature requests

Please submit bugs and feature requests [here](http://github.com/satya164/scrutiny/issues). Pull requests are always welcome.

Pull requests must follow the `.editorconfig` settings and pass `eslint` validation.
