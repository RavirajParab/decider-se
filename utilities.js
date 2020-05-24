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

const csvJSON = (csv) => {
  const lines = csv.split("\n");
  const result = [];
  let headers = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(",");
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
};

const getUrl = (security, noOfDays) => {
  const current = Math.round(new Date() / 1000);
  const past = current - 86400 * noOfDays;
  return `https://query1.finance.yahoo.com/v7/finance/download/${security}.NS?period1=${past}&period2=${current}&interval=1d&events=history`;
};

const getGain = (data) => {
  if(data[0]){
    const length = data.length;
    const oldClosing = data[0].Close;
    const newClosing = data[length - 1].Close;
    const gain = Math.round(((newClosing - oldClosing) * 100) / newClosing);
    return gain;
  }else{
    return NaN;
  }
 
};

const getSecDataForDays = async (securityName, noOfDays) => {
  const url = getUrl(securityName, noOfDays);
  const response = await fetch(url);
  const text = await response.text();
  return csvJSON(text);
};

const invertedGreenHammer = (data) => {
  const candleWidth = data.Close - data.Open;
  const totalWidth = data.High - data.Low;
  const hammerStrength = totalWidth / candleWidth;
  if (
    hammerStrength > 3.5 &&
    candleWidth > 0 &&
    data.Open / data.Low < 1.017 &&
    data.Close / data.Open > 1.0077
  ) {
    console.log(`${data.Date} formed InvertedGreenHammer`);
  }
};

const greenHammer = (data) => {
  const candleWidth = data.Close - data.Open;
  const totalWidth = data.High - data.Low;
  const hammerStrength = totalWidth / candleWidth;
  if (
    hammerStrength > 3.5 &&
    candleWidth > 0 &&
    data.High / data.Close < 1.017 &&
    data.Close / data.Open > 1.0077
  ) {
    console.log(`${data.Date} formed GreenHammer`);
  }
};

const redHammer = (data) => {
  const candleWidth = data.Open - data.Close;
  const totalWidth = data.High - data.Low;
  const hammerStrength = totalWidth / candleWidth;
  if (
    hammerStrength > 3.5 &&
    candleWidth > 0 &&
    data.High / data.Open < 1.017 &&
    data.Open / data.Close > 1.0077
  ) {
    console.log(`${data.Date} formed RedHammer`);
  }
};

const invertedRedHammer = (data) => {
  const candleWidth = data.Open - data.Close;
  const totalWidth = data.High - data.Low;
  const hammerStrength = totalWidth / candleWidth;
  if (
    hammerStrength > 3.5 &&
    candleWidth > 0 &&
    data.Close / data.Low < 1.017 &&
    data.Open / data.Close > 1.0077
  ) {
    console.log(`${data.Date} formed InvertedRedHammer`);
  }
};

const MatchPatterns = [
  invertedRedHammer,
  redHammer,
  greenHammer,
  invertedGreenHammer,
];

const TopCompanies = [
  "RELIANCE",
  "WIPRO",
  "LT",
  "BAJAJ-AUTO",
  "SUNPHARMA",
  "TCS",
  "MARUTI",
  "SBIN",
  "ASIANPAINT",
  "BHARTIARTL",
  "HDFCBANK",
  "AXISBANK",
  "INFY",
  "CIPLA",
  "HINDALCO",
  "SHREECEM",
  "INDUSINDBK",
  "ULTRACEMCO",
  "TECHM",
  "BRITANNIA",
  "HEROMOTOCO",
  "GRASIM",
  "ONGC",
  "GAIL",
  "NTPC",
  "COALINDIA",
  "NESTLEIND",
  "TITAN",
  "MM",
  "BAJAJFINSV",
  "ZEEL",
  "HINDUNILVR",
  "HDFC",
  "KOTAKBANK",
  "ICICIBANK",
  "ITC",
];

const getAllCompaniesReboundRates = async () => {
  const allratesPromise = TopCompanies.map(
    async (sec) => await getSecReboundrate(sec, 120, 3.5)
  );
  const rates = await Promise.all(allratesPromise);
  const orderedRates = rates.filter((i) => i.reboundRate >= 80)
                            .sort((b,a)=>a.reboundRate-b.reboundRate);
  return orderedRates;
};


const getSecReboundrate = async (security, noOfDays, fallPercentage) => {
  const data = await getSecDataForDays(security, noOfDays);
  const filteredData = [];
  data.forEach((i, k) => {
    const todayGain = ((i.Open - i.Close) * 100) / i.Open;
    if (todayGain >= fallPercentage) {
      if (k < data.length - 1) {
        filteredData.push({
          ...i,
          NextDayHigh: data[k + 1].High,
          NextDate: data[k + 1].Date,
          NextDayOpen : data[k + 1].Open,
          WorstfallRate :(Math.round(i.Open-i.Low)/i.Open)*100,
          NextDayOpensLower :data[k + 1].Open<i.Close?true:false,
          NextDayMxGain: ((data[k + 1].High - i.Close) * 100) / i.Close,
        });
      }
    }
  });
  
  //passing and failing % evaluator
  const gainers = filteredData.filter((i) => i.NextDayMxGain > 1);
  const reboundRate = Math.round((gainers.length * 100) / filteredData.length);
  const fallrates=gainers.map(i=>i.WorstfallRate);
  const maxfallRate = Number((Math.max.apply(Math,fallrates)).toFixed(2));
  const minfallRate = Number((Math.min.apply(Math,fallrates)).toFixed(2));
  const avgFallRate = Number((average(fallrates)).toFixed(2));
  const openedLowerNextDay = filteredData.filter((i) => i.NextDayOpensLower).length;
  
  return {
    security,
    reboundRate,
    validity: noOfDays,
    oppurtionities: gainers.length,
   // data :gainers,  //uncomment if you need the data of the days and dates
    maxfallRate,
    minfallRate,
    avgFallRate,
    openedLowerNextDay
  };
};



const average = (array=[]) =>{ 
  if(array.length){
    return array.reduce((a, b) => a + b) / array.length
  }else{
    return 0
  }
}

const getRankings = async (duration) => {
  const companyData = TopCompanies.map(async (company) => {
    const data = await getSecDataForDays(company, duration);
    const gain = getGain(data);
    return {
      Name: company,
      Gain: gain,
    };
  });
  return await Promise.all(companyData);
};

const getGainRankings = async ()=>{
  const data =await getRankings(20);
  const sortedData = data.sort((a,b)=>a.Gain-b.Gain);
  return sortedData;
}

module.exports = {
  getRSI,
  getNearLow,
  getAVD,
  getMMI,
  getGainRankings,
  getAllCompaniesReboundRates
};
