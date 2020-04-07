const {getRSI} = require("../utilities");
module.exports = async function (context, req) {
  const rsiData = await getRSI()
  context.res = {
    body: rsiData,
  };
  context.done();
};
