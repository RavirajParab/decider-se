const {getNiftyETFData} = require("../utilities");
module.exports = async function (context, req) {
  const etfData = await getNiftyETFData()
  context.res = {
    body: etfData
  };
  context.done();
};
