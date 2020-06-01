const {GetBalance} = require("../mongoUtil");
module.exports = async function (context, req) {
  const balance = await GetBalance()
  context.res = {
    body: balance
  };
  context.done();
};
