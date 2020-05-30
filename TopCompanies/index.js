const {getTopCompanies} = require("../utilities");
module.exports = async function (context, req) {
  const companies = await getTopCompanies()
  context.res = {
    body: companies
  };
  context.done();
};
