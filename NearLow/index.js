const {getNearLow} = require("../utilities");
module.exports = async function (context, req) {
  const nearLow = await getNearLow()
  context.res = {
    body: nearLow,
  };
  context.done();
};
