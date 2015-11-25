const Scrutiny = require("scrutiny");
const scrutiny = new Scrutiny();

scrutiny.register("email", function(value) {
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]+$/.test(value)) {
        throw new Scrutiny.Error("'" + value + "' is not a valid email address");
    }
});

try {
    const input = "you@example.com";

    await scrutiny.validate(
        input,
        scrutiny.checks.email
    );

    console.log("Validation passed", input)
} catch (error) {
    if (error instanceof Scrutiny.Error) {
        console.error("Validation failed", error);
    } else {
        console.error("Some other error occured", error);
    }
}
