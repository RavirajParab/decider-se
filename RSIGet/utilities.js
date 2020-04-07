const getRSI=async (url)=>{
    const unParsed = await fetch(url);
    const ParsedData = await unParsed.json();
    return ParsedData;
}
