import { useEffect, useState } from "react";
import { createTheme, MantineProvider } from '@mantine/core';
import DropZone from './components/dragdrop'
import ReceiptTable from './components/receipttable';
import type { Item, ParsedData } from './types/results';
import Names from "./components/names";
import TaxAndTip from "./components/taxandtip";

function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [names, setNames] = useState<string[]>([]);

  const theme = createTheme({
  /** Your theme override here */
  });

  // useEffect(() => {
  //   if (parsedData) {


  //   }
  // }, [parsedData]);

  const dropzonestyle = parsedData ? "transition-all animate-slide duration-700 ease-in-out transition-transform absolute top-[1rem] left-[1rem] " : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl"

  return (
    <MantineProvider theme={theme}>
      <div className={``}> 

        
          <div className={dropzonestyle} >
            <DropZone setParsedData={setParsedData} parsedData={parsedData}/>
          </div>

        {parsedData ? (<div className="absolute top-30 left-1/2 -translate-x-1/2 -translate-y-1/ w-[80vw] flex flex-col items-center justify-center gap-10">
          <Names names={names} setNames={setNames}/>
        <ReceiptTable parsedData={parsedData} names={names}/>
        <TaxAndTip taxValue={parsedData.tax} tipValue={parsedData.tip}/>

        </div>) : null}
      
    </div>
            
    </MantineProvider>
  )
}

export default App
