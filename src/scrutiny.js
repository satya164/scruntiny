"use strict";

function Type() {
    // Handle situation where called without "new" keyword
    if (this instanceof Type === false) {
        throw new Error("Constructor Type requires 'new'");
    }

    this.checks = Object.create(Type.defaultChecks);

    Object.defineProperty(this.checks, "__instance__", { value: this, enumerable: false });
}

Type.defaultChecks = {

    // Default checks

    any: function() {},

    undef: function(value) {
        if (typeof value !== "undefined") {
            throw new Error("ERR_VALUE_DEFINED");
        }
    },

    string: function(value) {
        if (typeof value !== "string") {
            throw new Error("ERR_INVALID_STRING");
        }
    },

    bool: function(value) {
        if (typeof value !== "boolean") {
            throw new Error("ERR_INVALID_BOOL");
        }
    },

    number: function(value) {
        if (typeof value !== "number" || isNaN(value)) {
            throw new Error("ERR_INVALID_NUMBER");
        }
    },

    func: function(value) {
        if (typeof value !== "function") {
            throw new Error("ERR_INVALID_FUNC");
        }
    },

    array: function(value) {
        if (!Array.isArray(value)) {
            throw new Error("ERR_INVALID_ARRAY");
        }
    },

    object: function(value) {
        if (typeof value !== "object" || value === null) {
            throw new Error("ERR_INVALID_OBJECT");
        }
    },


    // Helpers

    instanceOf: function(instance) {
        return function(value) {
            if (value instanceof instance === false) {
                throw new Error("ERR_INVALID_INSTANCE");
            }
        };
    },

    oneOf: function(values) {
        return function(value) {
            if (values.indexOf(value) === -1) {
                throw new Error("ERR_NOT_ONE_OF");
            }
        };
    },

    arrayOf: function(check) {
        return function(value) {
            var self = this;

            return self.validate(value, self.checks.array).then(function() {
                return Promise.all(value.map(function(item) {
                    return self.validate(item, check);
                }));
            }).catch(function() {
                throw new Error("ERR_NOT_ARRAY_OF");
            });
        };
    },

    objectOf: function(check) {
        return function(value) {
            var self = this;

            return self.validate(value, self.checks.object).then(function() {
                var promises = [];

                for (var prop in value) {
                    promises.push(self.validate(value[prop], check));
                }

                return Promise.all(promises).catch(function() {
                    throw new Error("ERR_NOT_OBJECT_OF");
                });
            });
        };
    },

    oneOfType: function(checks) {
        return function(value) {
            var self = this;

            return Promise.all(checks.map(function(c) {
                return self.validate(value, c).then(function() {
                    return true;
                }, function() {
                    return false;
                });
            })).then(function(results) {
                if (results.indexOf(true) === -1) {
                    throw new Error("ERR_NOT_ONE_OF_TYPE");
                }
            });
        };
    },

    shape: function(shape) {
        return function(value) {
            var self = this;

            return self.validate(value, self.checks.object).then(function() {
                var shapeKeys = Object.keys(shape),
                    valueKeys = Object.keys(value),
                    key, promises;

                if (shapeKeys.length > valueKeys.length) {
                    throw new Error();
                }

                promises = [];

                for (var i = 0, l = shapeKeys.length; i < l; i++) {
                    key = shapeKeys[i];

                    if (valueKeys.indexOf(key) > -1) {
                        promises.push(self.validate(value[key], shape[key]));
                    } else {
                        throw new Error();
                    }
                }

                return Promise.all(promises);
            }).catch(function() {
                throw new Error("ERR_INVALID_SHAPE");
            });
        };
    }
};

Type.prototype.register = function(check, validator) {
    if (typeof check !== "string" || check.length === 0) {
        throw new TypeError("Invalid string " + check);
    }

    if (this[check]) {
        throw new Error("Check '" + check + "' already exists.");
    }

    if (typeof validator !== "function") {
        throw new TypeError("Invalid validator " + validator);
    }

    this.checks[check] = validator;
};

Type.prototype.validate = function(value) {
    var checks = Array.prototype.slice.call(arguments, 1),
        self = this;

    return Promise.all(checks.map(function(check) {
        return new Promise(function(resolve) {
            resolve(check.call(self, value));
        });
    })).then(function() {
        return value;
    });
};

module.exports = Type;
