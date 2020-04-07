const {getDividends} = require("../utilities");
module.exports = async function (context, req) {
  const dividends = await getDividends()
  context.res = {
    body: dividends,
  };
  context.done();
};

