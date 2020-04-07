const {getMMI} = require("../utilities");
module.exports = async function (context, req) {
  const mmi = await getMMI()
  context.res = {
    body: mmi,
  };
  context.done();
};

