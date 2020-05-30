const {getQuote} = require("../utilities");
module.exports = async function (context, req) {
  const rsiData = await getQuote(req)
  context.res = {
    body: rsiData,
  };
  context.done();
};
