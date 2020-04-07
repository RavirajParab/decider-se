const util = require('./utilities');
module.exports = async function (context, req) {
   const RSIdata = await util.getRSI('https://quotes-api.tickertape.in/quotes?sids=ITC,MRTI,RELI,SBI,TCS');
};