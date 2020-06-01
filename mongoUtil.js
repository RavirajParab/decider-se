const { MongoClient } = require("mongodb");

async function Connect() {
  //username for mongo login : ravirajparab44@gmail.com
  const constring =
    "mongodb+srv://learner:learner@mycluster-2wsgs.azure.mongodb.net";
  const client = await MongoClient.connect(constring, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  return client;
}

const GetShortPositions=async ()=>{
    const client = await Connect();
    const openPositions=await client.db('DBDecider')
                                .collection('Shorts')
                                .find({
                                    Position:'open'
                                })
                                .toArray();
    return openPositions;
}

const CoverShortPosition=async (coverShort)=>{
    const client = await Connect();
    /*
    const coverShort ={
        Symbol :'INFY',
        SellPrice: 980
    }
    */
    const shortsOfSymbol=await client.db('DBDecider')
                            .collection('Shorts')
                            .find({
                                Position:'open',
                                Symbol :coverShort.Symbol
                            })
                            .toArray();
     let pl=0;                       
    //calculate profit or loss
    shortsOfSymbol.forEach(i=>{
        pl+=i.Qty*(i.Buy-coverShort.SellPrice);
    })
    if(pl>0){
        pl=0.9*pl
    }     
    //add the Pl to the balance
    await client
    .db("DBDecider")
    .collection("Balance")
    .findOneAndUpdate({ ID: 1 }, { $inc: { Balance: pl } });

}

const GetBalance=async ()=>{
    const client = await Connect();
    const Balance=await client
    .db("DBDecider")
    .collection("Balance")
    .findOne({ ID: 1 });
    return Balance.Balance;
}


const AddShortPosition = async (shortPosition) => {
  const client = await Connect();
  //short Position
  /*
  const shortPosition = {
    Type: "short",
    Symbol: "INFY",
    Buy: 987.5,
    Qty: 1,
    Position:'open'
  };
  */
  //add the position
  
    const InsertedShort=await client.db('DBDecider')
    .collection('Shorts')
    .insertOne(shortPosition);
    
  const balanceToBeDeducted = shortPosition.Buy * shortPosition.Qty;

  //add balance

  await client
    .db("DBDecider")
    .collection("Balance")
    .findOneAndUpdate({ ID: 1 }, { $inc: { Balance: -balanceToBeDeducted } });

  //finally close the client
  client.close();
  //return InsertedShort;
};

module.exports={
    GetBalance,
    AddShortPosition,
    CoverShortPosition,
    GetShortPositions
}
