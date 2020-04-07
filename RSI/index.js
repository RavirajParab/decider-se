const util = require("../utilities");
module.exports = async function (context, req) {
  const rsiData = await util.getRSI()
  context.res = {
    body: rsiData,
  };
  context.done();
};
