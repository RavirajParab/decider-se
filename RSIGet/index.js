const util = require("./utilities");
module.exports = async function (context, req) {
  const RSIdata = await util.getRSI(
    "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BETWEEN_20_AND_30&pagesize=500"
  );
  context.res = {
    body: { data: RSIdata },
  };
  context.done();
};
