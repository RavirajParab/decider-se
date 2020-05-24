const {getAllCompaniesReboundRates} = require("../utilities");
module.exports = async function (context, req) {
  const reboundRates = await getAllCompaniesReboundRates()
  context.res = {
    body: reboundRates
  };
  context.done();
};
