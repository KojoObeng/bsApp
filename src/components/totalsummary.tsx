import type { NameInfo, NameMatrix, ParsedData } from '../types/results';
// import cx from 'clsx';
import { Paper } from '@mantine/core';
import './totalsummary.css';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { IconDownload } from '@tabler/icons-react';

interface TotalSummaryProps {
  parsedData: ParsedData;
  names: NameInfo[];
  nameMatrixHook: [NameMatrix, Dispatch<SetStateAction<NameMatrix>>];
  nameHook: [NameInfo[], Dispatch<SetStateAction<NameInfo[]>>];
  taxValueHook: [number, React.Dispatch<React.SetStateAction<number>>],
  tipValueHook: [number, React.Dispatch<React.SetStateAction<number>>],
  taxTypeHook: [string, React.Dispatch<React.SetStateAction<string>>],
  tipTypeHook: [string, React.Dispatch<React.SetStateAction<string>>],
}

export function TotalSummary({
  nameMatrixHook,
  nameHook,
  parsedData,
  taxValueHook,
  tipValueHook,
  taxTypeHook,
  tipTypeHook,
}: TotalSummaryProps) {
  const [names,] = nameHook;
  const [nameMatrix,] = nameMatrixHook;
  const allNames = useMemo(
    () =>
      Object.values(nameMatrix).reduce((acc, nameSet) => {
        return new Set([...acc, ...nameSet]);
      }, new Set()),
    [nameMatrix],
  );

  const noTaxNoTip = parsedData.items.reduce((acc, item) => {
    return acc + item.Price * item.Quantity;
  }, 0);

  const taxAmount =
    taxTypeHook[0] === 'Amount'
      ? taxValueHook[0]
      : noTaxNoTip * (taxValueHook[0] / 100);
  const tipAmount =
    tipTypeHook[0] === 'Amount'
      ? tipValueHook[0]
      : noTaxNoTip * (tipValueHook[0] / 100);
  const total = noTaxNoTip + taxAmount + tipAmount; 

  const personCost = useMemo(() => {
    return names.reduce(
      (acc, nameInfo) => {
        const nameID = nameInfo.id;

        // compute total for this person
        const totalForPerson = Object.keys(nameMatrix).reduce((sum, itemID) => {
          const itemInfo = parsedData.items.find((it) => it.id === itemID);
          if (!itemInfo) return sum;

          const itemTotal = itemInfo.Price * itemInfo.Quantity;
          const nameListForItem = nameMatrix[itemID];

          return nameListForItem.has(nameID)
            ? sum + itemTotal / nameListForItem.size
            : sum;
        }, 0);

        return { ...acc, [nameID]: totalForPerson };
      },
      {} as Record<string, number>,
    );
  }, [names, nameMatrix, parsedData]);

  const personOwes = useMemo(() => {
    return Object.entries(personCost).map(([nameID, amount]) => {
      const percentageOfTotal = noTaxNoTip > 0 ? amount / noTaxNoTip : 0;
      const total = amount + taxAmount * percentageOfTotal + tipAmount * percentageOfTotal;
      const nameInfo = names.find((name) => name.id === nameID);
      return { name: nameInfo?.name ?? '', total };
    });
  }, [names, personCost, noTaxNoTip, taxAmount, tipAmount]);

  const personOwesTotal = useMemo(
    () => personOwes.reduce((sum, p) => sum + p.total, 0),
    [personOwes],
  );

  const handleDownloadClick = () => {
    const subTotalText = `Subtotal: $${noTaxNoTip.toFixed(2)}\n`;
    const taxText = `Tax: $${taxAmount.toFixed(2)}\n`;
    const tipText = `Tip: $${tipAmount.toFixed(2)}\n`;
    const totalText = `Total: $${total.toFixed(2)}\n\n`;
    const perPersonText = 'Amount each person owes:\n\n';
    const startingText =
      subTotalText + taxText + tipText + totalText + perPersonText;
    let lineItemStrings = '';
    allNames.forEach((nameID) => {
      const nameInfo = names.find((name) => name.id === nameID);
      let totalShareWithoutTaxAndTip = 0;
      lineItemStrings += `${nameInfo?.name}:\n`;
      Object.keys(nameMatrix).forEach((itemID) => {
        const isIncludedInThisItem = nameMatrix[itemID].has(nameID);

        if (isIncludedInThisItem) {
          const itemInfo = parsedData.items.find((it) => it.id === itemID);
          const itemName = itemInfo?.Name;
          if (itemInfo) {
            const itemTotal = itemInfo.Price * itemInfo.Quantity;
            const nameListForItem = nameMatrix[itemID];
            const shareForThisItem = itemTotal / nameListForItem.size;
            totalShareWithoutTaxAndTip += shareForThisItem;
            const shareStr = shareForThisItem.toFixed(2);
            lineItemStrings += `   - ${itemName}: $${shareStr}\n`;
          }
        }
      });
      const percentageOfTotal = totalShareWithoutTaxAndTip / noTaxNoTip;
      const taxPortion = (taxAmount * percentageOfTotal).toFixed(2);
      lineItemStrings += `Taxes: $${taxPortion}\n`;
      const tipPortion = (tipAmount * percentageOfTotal).toFixed(2);
      lineItemStrings += `Tip: $${tipPortion}\n`;
      const totalForPerson = (
        totalShareWithoutTaxAndTip +
        parseFloat(taxPortion) +
        parseFloat(tipPortion)
      ).toFixed(2);
      lineItemStrings += `Total: $${totalForPerson}\n`;
      lineItemStrings += '\n';
    });

    const text = startingText + lineItemStrings;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'detailedbreakdown.txt';
    a.click();

    URL.revokeObjectURL(url); // cleanup
  };

  return (
    <div className="flex gap-6 mb-10 w-full flex-col max-w-[70rem] items-center">
      <div className="flex gap-4 justify-center w-full">
        <Paper shadow="xl" radius="xl" withBorder classNames={{ root: 'paper' }}>
          <p className="summary-label">Summary</p>
          <div className="summary-row"><span>Subtotal</span><span>${noTaxNoTip.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax</span><span>${taxAmount.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tip</span><span>${tipAmount.toFixed(2)}</span></div>
          <div className="summary-row total-row"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </Paper>
        <Paper shadow="xl" radius="xl" withBorder classNames={{ root: 'paper' }}>
          <p className="summary-label">Each person owes</p>
          {personOwes.map((p) => (
            <div key={p.name} className="summary-row"><span>{p.name}</span><span>${p.total.toFixed(2)}</span></div>
          ))}
          <div className="summary-row total-row"><span>Total</span><span>${personOwesTotal.toFixed(2)}</span></div>
        </Paper>
      </div>
      <button onClick={handleDownloadClick} className="download-btn">
        Download Detailed Summary
        <IconDownload size={14} />
      </button>
    </div>
  );
}

export default TotalSummary;
