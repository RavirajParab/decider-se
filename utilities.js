const fetch = require("node-fetch");
const { RSI } = require("technicalindicators");

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

const getSecRSI = async (symbol) => {
  const data = await getSecDataForDays(symbol, 30);
  const itemsToBeRemoved = data.length - 15;
  data.splice(0, itemsToBeRemoved);
  const closings = data.map((i) => i.Close);
  const inputRSI = {
    values: closings,
    period: 14,
  };
  const currentData = data[14];
  if (currentData) {
    return {
      Symbol: symbol,
      RSI: RSI.calculate(inputRSI)[0],
      Date: currentData.Date,
      Open: currentData.Open,
      Close: currentData.Close,
      PreviousClose: data[13].Close,
      YesterdayChange :Number(
        (((data[13].Close - data[12].Close) * 100) / data[12].Close).toFixed(
          2
        )
      ),
      Change: Number(
        (((currentData.Close - data[13].Close) * 100) / data[13].Close).toFixed(
          2
        )
      ),
      Change14: Number(
        (((currentData.Close - data[0].Close) * 100) / data[0].Close).toFixed(2)
      ),
      Change5: Number(
        (((currentData.Close - data[10].Close) * 100) / data[10].Close).toFixed(
          2
        )
      ),
      Low: currentData.Low,
      High: currentData.High,
      Volume: currentData.Volume,
    };
  }
};

const getRSIForAllTopCompanies = async () => {
  const allTop200Companies = await getTop200Companies();
  const allTopRSIPromise = allTop200Companies.map((i) => getSecRSI(i.Symbol));
  const rsiData = await Promise.all(allTopRSIPromise);
  return rsiData;
};

const getQuote = async (req) => {
  const url = `https://quotes-api.tickertape.in/quotes?sids=${req.query.sid}`;
  const resprom = await fetch(url);
  const res = await resprom.json();
  return res.data;
};

module.exports = {
  getAVD,
  getMMI,
  getQuote,
  getRSIForAllTopCompanies,
};
