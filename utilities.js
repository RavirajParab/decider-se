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

const getNearLow = async () => {
  const url =
    "https://etmarketsapis.indiatimes.com/ET_Stats/near52weekslow?pagesize=5000&exchange=nse&pageno=1&sortby=current&sortorder=desc&marketcap=largecap%2Cmidcap";
  const nearLowPromise = await fetch(url);
  const nearLowData = await nearLowPromise.json();
  return nearLowData;
};

const getAVD = async () => {
  const url =
    "https://etmarketsapis.indiatimes.com/ET_Stats/getAllIndices?exchange=nse&sortby=value&sortorder=desc&pagesize=5000";
  const AVDPromise = await fetch(url);
  const AVDData = await AVDPromise.json();
  const AVD = AVDData.searchresult.find((i) => i.indexName == "Nifty 200");
  const AVDRatio =
    ((Number(AVD.advances) * 100) / 200).toFixed(2) + "% Bullish";
  return AVDRatio;
};

const getMMI = async () => {
  const RawMMIData = await fetch("https://api.tickertape.in/mmi/now");
  const MMIData = await RawMMIData.json();

  let data = MMIData.data;
  let Current =
    data.daily[0].value.toFixed(2) +
    " - " +
    ShowGreedAndFearLevel(data.daily[0].value);
  let Yesterday =
    data.lastDay.indicator.toFixed(2) +
    " - " +
    ShowGreedAndFearLevel(data.lastDay.indicator);
  let LastWeek =
    data.lastWeek.indicator.toFixed(2) +
    " - " +
    ShowGreedAndFearLevel(data.lastWeek.indicator);
  let LastMonth =
    data.lastMonth.indicator.toFixed(2) +
    " - " +
    ShowGreedAndFearLevel(data.lastMonth.indicator);
  let LastYear =
    data.lastYear.indicator.toFixed(2) +
    " - " +
    ShowGreedAndFearLevel(data.lastYear.indicator);
  return {
    Current,
    Yesterday,
    LastWeek,
    LastMonth,
    LastYear,
  };
};

const ShowGreedAndFearLevel = (MMILevel) => {
  if (MMILevel >= 70) {
    return "Extreme Greed";
  } else if (MMILevel > 52 && MMILevel < 70) {
    return "Greed";
  } else if (MMILevel >= 48 && MMILevel <= 52) {
    return "Neutral";
  } else if (MMILevel < 48 && MMILevel >= 29) {
    return "Fear";
  } else {
    return "Extreme Fear";
  }
};

module.exports = {
  getRSI,
  getNearLow,
  getAVD,
  getMMI,
};
