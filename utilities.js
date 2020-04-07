const fetch = require("node-fetch");
const RSIAllUrls = [
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BELOW_20&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BETWEEN_20_AND_30&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BETWEEN_30_AND_70&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_BETWEEN_70_AND_80&pagesize=500",
  "https://sas.indiatimes.com/TechnicalsClient/getRSI.htm?crossovertype=RSI_ABOVE_80&pagesize=500",
];

const getRSI = async (url) => {
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

module.exports = {
  getRSI,
};
