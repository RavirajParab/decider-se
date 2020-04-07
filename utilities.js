const fetch = require("node-fetch");
const RSIAllUrls = [
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BELOW_20&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BETWEEN_20_AND_30&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BETWEEN_30_AND_70&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BETWEEN_70_AND_80&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_ABOVE_80&pagesize=500",
];

const getRSI = async () => {
  const AllRSIJSOnDataPromises = RSIAllUrls.map((url) => fetch(url));
  const AllRSIJSOnData = await Promise.all(AllRSIJSOnDataPromises);
  const AllRSIFinalDataPromises = AllRSIJSOnData.map((eachData) =>
    eachData.json()
  );
  const AllRSIFinalData = await Promise.all(AllRSIFinalDataPromises);
  const AgreggatedData = [
    ...AllRSIFinalData[0].searchResult,
    ...AllRSIFinalData[1].searchResult,
    ...AllRSIFinalData[2].searchResult,
    ...AllRSIFinalData[3].searchResult,
    ...AllRSIFinalData[4].searchResult,
  ];
  return AgreggatedData;
};

const getNearLow= async ()=>{
  const url='https://etmarketsapis.indiatimes.com/ET_Stats/near52weekslow?pagesize=5000&exchange=nse&pageno=1&sortby=current&sortorder=desc&marketcap=largecap%2Cmidcap';
  const nearLowPromise=await fetch(url);
  const nearLowData=await nearLowPromise.json();
  const nearLow=nearLowData.searchresult.map(i=>{
    return{
      'Name':i.nseScripCode,
    }
  });
  const RSISelected=RSI_ALL.filter(i=>(nearLow.findIndex(j=>j.Name==i.scripCode)>-1));
  return RSISelected;
}

module.exports = {
  getRSI,
  getNearLow
};
