const {getTop200Companies} = require("../utilities");
module.exports = async function (context, req) {
  const companies = await getTop200Companies()
  context.res = {
    body: companies
  };
  context.done();
};
