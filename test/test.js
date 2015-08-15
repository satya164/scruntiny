/* eslint-env mocha */

"use strict";

var Scrutiny = require("../src/scrutiny.js"),
    assert = require("assert");

describe("core", function() {
    it("should set custom Promise object", function() {
        var scrutiny = new Scrutiny();

        Scrutiny.setPromise(require("bluebird"));

        return scrutiny.validate(null, scrutiny.checks.any).done(function() {
            assert(true);

            Scrutiny.setPromise(global.Promise);
        });
    });

    it("should not register invalid function", function() {
        var scrutiny = new Scrutiny();

        assert.throws(function() {
            scrutiny.register("", function() {});
        }, TypeError);

        assert.throws(function() {
            scrutiny.register("invalid", null);
        }, TypeError);
    });

    it("should not mix checks of different instances", function() {
        var instance1 = new Scrutiny(),
            instance2 = new Scrutiny();

        instance1.register("type1", function() {});

        instance2.register("type2", function() {});

        assert(instance1.checks.type1 && !instance1.checks.type2);
        assert(instance2.checks.type2 && !instance2.checks.type1);
    });

    it("should throw proper Scrutiny.Error", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(null, scrutiny.checks.undef).then(function() {
            assert(false);
        }, function(err) {
            assert(err instanceof Scrutiny.Error);
            assert(err.stack);
            assert.equal(err.name, "Scrutiny.Error");
        });
    });

    it("should not throw a Scrutiny.Error", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(null, function() {
            throw new TypeError();
        }).then(function() {
            assert(false);
        }, function(err) {
            assert.notEqual(err instanceof Scrutiny.Error, true);
        });
    });

    it("should register and validate", function() {
        var scrutiny = new Scrutiny();

        scrutiny.register("veggie", function(value) {
            var veggies = [ "potato", "tomato" ];

            if (veggies.indexOf(value) === -1) {
                throw new Scrutiny.Error("ERR_INVALID_VEGGIE");
            }
        });

        scrutiny.register("fruit", function(value) {
            var fruits = [ "apple", "orange", "banana", "tomato" ];

            if (fruits.indexOf(value) === -1) {
                throw new Scrutiny.Error("ERR_INVALID_FRUIT");
            }
        });

        return scrutiny.validate("water", scrutiny.checks.veggie).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_VEGGIE");
        }).then(function() {
            return scrutiny.validate("tomato", scrutiny.checks.veggie);
        }).then(function() {
            return scrutiny.validate("sugar", scrutiny.checks.fruit);
        }).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_FRUIT");
        }).then(function() {
            return scrutiny.validate("apple", scrutiny.checks.fruit);
        }).then(function() {
            return scrutiny.validate("apple", scrutiny.checks.fruit, scrutiny.checks.veggie);
        }).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_VEGGIE");
        }).then(function() {
            return scrutiny.validate("potato", scrutiny.checks.fruit, scrutiny.checks.veggie);
        }).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_FRUIT");
        }).then(function() {
            return scrutiny.validate("fish", scrutiny.checks.fruit, scrutiny.checks.veggie);
        }).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_FRUIT");
        }).then(function() {
            return scrutiny.validate("tomato", scrutiny.checks.fruit, scrutiny.checks.veggie);
        }).then(function(value) {
            assert.equal(value, "tomato");
        });
    });

    it("should pass async validation", function() {
        var scrutiny = new Scrutiny(),
            thing = "thing";

        return scrutiny.validate(thing, function() {
            return new Promise(function(resolve) {
                setTimeout(function() {
                    resolve(thing);
                }, 5);
            });
        }).then(function(value) {
            assert.equal(value, thing);
        });
    });

    it("should fail async validation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate("shoot", function() {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    reject(new Scrutiny.Error("ERR_ITS_WRONG"));
                }, 5);
            });
        }).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_ITS_WRONG");
        });
    });
});

describe("undefined", function() {
    it("should pass undefined validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(undefined, scrutiny.checks.undef).then(function(value) {
            assert.equal(value, undefined);
        });
    });

    it("should fail undefined validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(NaN, scrutiny.checks.undef).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_VALUE_DEFINED");
        });
    });
});

describe("string", function() {
    it("should pass string validatation", function() {
        var scrutiny = new Scrutiny(),
            string = "john snow";

        return scrutiny.validate(string, scrutiny.checks.string).then(function(value) {
            assert.equal(value, string);
        });
    });

    it("should fail string validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(null, scrutiny.checks.string).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_STRING");
        });
    });
});

describe("boolean", function() {
    it("should pass boolean validatation", function() {
        var scrutiny = new Scrutiny(),
            bool = false;

        return scrutiny.validate(bool, scrutiny.checks.bool).then(function(value) {
            assert.equal(value, bool);
        });
    });

    it("should fail boolean validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(0, scrutiny.checks.bool).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_BOOL");
        });
    });
});

describe("number", function() {
    it("should pass number validatation", function() {
        var scrutiny = new Scrutiny(),
            num = 108;

        return scrutiny.validate(num, scrutiny.checks.number).then(function(value) {
            assert.equal(value, num);
        });
    });

    it("should fail number validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(NaN, scrutiny.checks.number).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_NUMBER");
        }).then(function() {
            return scrutiny.validate("5", scrutiny.checks.number);
        }).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_NUMBER");
        });
    });
});

describe("function", function() {
    it("should pass function validatation", function() {
        var scrutiny = new Scrutiny(),
            func = function() {};

        return scrutiny.validate(func, scrutiny.checks.func).then(function(value) {
            assert.equal(value, func);
        });
    });

    it("should fail function validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(null, scrutiny.checks.func).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_FUNC");
        });
    });
});

describe("array", function() {
    it("should pass array validatation", function() {
        var scrutiny = new Scrutiny(),
            arr = [ "a", "b", "c" ];

        return scrutiny.validate(arr, scrutiny.checks.array).then(function(value) {
            assert.equal(value, arr);
        });
    });

    it("should fail array validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate({ 0: "a", 1: "b", length: 2 }, scrutiny.checks.array).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_ARRAY");
        });
    });
});

describe("object", function() {
    it("should pass object validatation", function() {
        var scrutiny = new Scrutiny(),
            obj = { color: "pink" };

        return scrutiny.validate(obj, scrutiny.checks.object).then(function(value) {
            assert.equal(value, obj);
        });
    });

    it("should fail object validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate(543, scrutiny.checks.object).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_OBJECT");
        }).then(function() {
            return scrutiny.validate(null, scrutiny.checks.object);
        }).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_OBJECT");
        });
    });
});

describe("oneOf", function() {
    it("should pass oneOf validatation", function() {
        var scrutiny = new Scrutiny(),
            item = "apple";

        return scrutiny.validate(item, scrutiny.checks.oneOf([ "apple", "banana" ])).then(function(value) {
            assert.equal(value, item);
        });
    });

    it("should fail oneOf validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate("orange", scrutiny.checks.oneOf([ "apple", "banana" ])).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_NOT_ONE_OF");
        });
    });
});

describe("arrayOf", function() {
    it("should pass arrayOf validatation", function() {
        var scrutiny = new Scrutiny(),
            arr = [ 1, 2, 3 ];

        return scrutiny.validate(arr, scrutiny.checks.arrayOf(scrutiny.checks.number)).then(function(value) {
            assert.equal(value, arr);
        });
    });

    it("should fail arrayOf validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate([ "a", "b", "c" ], scrutiny.checks.arrayOf(scrutiny.checks.number)).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_NOT_ARRAY_OF");
        });
    });
});

describe("objectOf", function() {
    it("should pass objectOf validatation", function() {
        var scrutiny = new Scrutiny(),
            arr = { fruits: [ "a", "b", "c" ] };

        return scrutiny.validate(arr, scrutiny.checks.objectOf(scrutiny.checks.arrayOf(scrutiny.checks.string))).then(function(value) {
            assert.equal(value, arr);
        });
    });

    it("should fail objectOf validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate({ items: 3 }, scrutiny.checks.objectOf(scrutiny.checks.string)).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_NOT_OBJECT_OF");
        });
    });
});

describe("oneOfType", function() {
    it("should pass oneOfType validatation", function() {
        var scrutiny = new Scrutiny(),
            item1 = "boo",
            item2 = 123;

        return scrutiny.validate(item1, scrutiny.checks.oneOfType([ scrutiny.checks.number, scrutiny.checks.string ])).then(function(value) {
            assert.equal(value, item1);
        }).then(function() {
            return scrutiny.validate(item2, scrutiny.checks.oneOfType([ scrutiny.checks.number, scrutiny.checks.string ]));
        }).then(function(value) {
            assert.equal(value, item2);
        });
    });

    it("should fail oneOfType validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate({}, scrutiny.checks.oneOfType([ scrutiny.checks.number, scrutiny.checks.string ])).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_NOT_ONE_OF_TYPE");
        });
    });
});

describe("shape", function() {
    it("should pass shape validatation", function() {
        var scrutiny = new Scrutiny(),
            shape = {
                name: "Flash",
                enemies: [ "Zoom", "Grodd" ],
                rating: 5
            };

        return scrutiny.validate(shape, scrutiny.checks.shape({
            name: scrutiny.checks.string,
            enemies: scrutiny.checks.arrayOf(scrutiny.checks.string)
        }));
    });

    it("should fail shape validatation", function() {
        var scrutiny = new Scrutiny();

        return scrutiny.validate({ name: "Batman" }, scrutiny.checks.shape({
            name: scrutiny.checks.string,
            enemies: scrutiny.checks.arrayOf(scrutiny.checks.string)
        })).then(function() {
            assert(false);
        }, function(e) {
            assert(e instanceof Scrutiny.Error);
            assert.equal(e.message, "ERR_INVALID_SHAPE");
        });
    });
});
