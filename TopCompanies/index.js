const {getRSIForAllTopCompanies} = require("../utilities");
module.exports = async function (context, req) {
  const companies = await getRSIForAllTopCompanies()
  context.res = {
    body: companies
  };
  context.done();
};
