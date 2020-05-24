const {getGainRankings} = require("../utilities");
module.exports = async function (context, req) {
  const ranks = await getGainRankings()
  context.res = {
    body: ranks
  };
  context.done();
};
