const {getAVD} = require("../utilities");
module.exports = async function (context, req) {
  const avd = await getAVD()
  context.res = {
    body: avd,
  };
  context.done();
};

