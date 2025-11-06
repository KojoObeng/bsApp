import { useEffect, useState } from 'react';
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import DropZone from './components/dragdrop';
import ReceiptTable from './components/receipttable';
import type { NameInfo, NameMatrix, ParsedData } from './types/results';
import Names from './components/names';
import TaxAndTip from './components/taxandtip';
import TotalSummary from './components/totalsummary';

function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const taxTypeHook = useState('Amount');
  const tipTypeHook = useState('Amount');
  const taxValueHook = useState<number>(parsedData?.tax ?? 0);
  const tipValueHook = useState<number>(parsedData?.tip ?? 0);
  const nameHook = useState<NameInfo[]>([]);
  const nameMatrixHook = useState<NameMatrix>({});

  const [names, setNames] = nameHook;
  const [, setNameMatrix] = nameMatrixHook;

  const theme = createTheme({
    /** Your theme override here */
  });

  useEffect(() => {
    const [, setTaxValue] = taxValueHook;
    const [, setTipValue] = tipValueHook;
    setTaxValue(parsedData?.tax ?? 0);
    setTipValue(parsedData?.tip ?? 0);
  }, [parsedData]);

  const handleNameRemove = (nameID: string) => () => {
    setNames((prev) => prev.filter((nameInfo) => nameInfo.id !== nameID));
    setNameMatrix((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((itemID) => {
        const nameSetForItem = updated[itemID]
        if (nameSetForItem.has(nameID)) nameSetForItem.delete(nameID);
        if (nameSetForItem.size === 0) delete updated[itemID];
      });
      return updated;
    });
  };

  const dropzonestyle = parsedData
    ? 'transition-all animate-slide duration-700 ease-in-out transition-transform absolute top-[1rem] left-[1rem] '
    : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl';

  return (
    <MantineProvider theme={theme}>
      <div className={``}>
        <div className={dropzonestyle}>
          <DropZone setParsedData={setParsedData} parsedData={parsedData} />
        </div>

        {parsedData ? (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/ w-[80vw] flex flex-col items-center justify-center gap-10">
            <Names
              nameHook={nameHook}
              nameMatrixHook={nameMatrixHook}
              handleNameRemove={handleNameRemove}
            />
            <ReceiptTable
              parsedData={parsedData}
              names={names}
              nameMatrixHook={nameMatrixHook}
            />
            <TaxAndTip
              taxValueHook={taxValueHook}
              tipValueHook={tipValueHook}
              taxTypeHook={taxTypeHook}
              tipTypeHook={tipTypeHook}
            />
            <TotalSummary
              names={names}
              parsedData={parsedData}
              nameHook={nameHook}
              nameMatrixHook={nameMatrixHook}
              taxValueHook={taxValueHook}
              tipValueHook={tipValueHook}
              taxTypeHook={taxTypeHook}
              tipTypeHook={tipTypeHook}
            />
          </div>
        ) : null}
      </div>
    </MantineProvider>
  );
}

export default App;
