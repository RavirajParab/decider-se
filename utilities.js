const fetch = require("node-fetch");
const {RSI} = require('technicalindicators');

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

const getTop200Companies = async () => {
  const url = `https://www1.nseindia.com/content/indices/ind_nifty200list.csv`;
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
  "M&M",
  "BAJAJFINSV",
  "ZEEL",
  "HINDUNILVR",
  "HDFC",
  "KOTAKBANK",
  "ICICIBANK",
  "ITC",
];


const getSecRSI=async (symbol)=>{
  const data = await getSecDataForDays(symbol, 30);
  const itemsToBeRemoved= data.length-15;
  data.splice(0,itemsToBeRemoved);
  const closings = data.map(i=>i.Close);
  const inputRSI={
    values:closings,
    period:14
  }
  const currentData=data[14];
  if(currentData){
    return {
      'Symbol': symbol,
      'RSI':RSI.calculate(inputRSI)[0],
      'Date':currentData.Date,
       'Open':currentData.Open,
       'Close':currentData.Close,
       'PreviousClose':data[13].Close,
       'Change':Number(((currentData.Close-data[13].Close)*100/data[13].Close).toFixed(2)),
       'Change14':Number(((currentData.Close-data[0].Close)*100/data[0].Close).toFixed(2)),
       'Low':currentData.Low,
       'High':currentData.High,
       'Volume':currentData.Volume
    }
  }
}


const getRSIForAllTopCompanies=async ()=>{
  const allTop200Companies = await getTop200Companies();
  const allTopRSIPromise = allTop200Companies.map(i=>getSecRSI(i.Symbol));
  const rsiData=await Promise.all(allTopRSIPromise);
  return rsiData;
}


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

const getLiveQuotes=async ()=>{
  const url=`https://quotes-api.tickertape.in/quotes?sids=RELI,WIPR,LART,BAJA,SUN,TCS,MRTI,SBI,ASPN,BRTI,HDBK,AXBK,INFY,CIPL,HALC,SHCM,INBK,ULTC,TEML,BRIT,HROM,GRAS,ONGC,GAIL,NTPC,COAL,NEST,TITN,MAHM,BJFS,ZEE,HLL,HDFC,KTKM,ICBK,ITC`;
  const resprom = await fetch(url);
  const res = await resprom.json(); 
  const liveQuotes = res.data.map((i,k)=>{
      return{
          ...i,
          sid : TopCompanies[k]
      }
  });
 return liveQuotes;
}

const getQuote=async (req)=>{
  const url=`https://quotes-api.tickertape.in/quotes?sids=${req.query.sid}`;
  const resprom = await fetch(url);
  const res = await resprom.json(); 
  return res.data;
}


module.exports = {
  getRSI,
  getNearLow,
  getAVD,
  getMMI,
  getGainRankings,
  getQuote,
  getRSIForAllTopCompanies
};
