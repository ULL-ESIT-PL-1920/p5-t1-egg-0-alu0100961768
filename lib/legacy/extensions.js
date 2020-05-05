const {specialForms} = require("./eggvm.js")

const eggExit= specialForms["exit"] = () => {
    console.log("GOODBYE!")
    process.exit(0);
}