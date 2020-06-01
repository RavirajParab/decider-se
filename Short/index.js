const {AllShorting} = require("../mongoUtil");
module.exports = async function (context, req) {
  const companies = await AllShorting(req);
  context.res = {
    body: companies
  };
  context.done();
};
