const util = require("../utilities");
module.exports = async function (context, req) {
  const nearLow = await util.getNearLow()
  context.res = {
    body: nearLow,
  };
  context.done();
};
