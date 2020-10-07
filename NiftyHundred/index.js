const {getNiftyHundredETData} = require("../utilities");
module.exports = async function (context, req) {
  const niftyHundred = await getNiftyHundredETData()
  context.res = {
    body: niftyHundred
  };
  context.done();
};
