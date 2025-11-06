import type { NameInfo, NameMatrix, ParsedData } from '../types/results';
// import cx from 'clsx';
import { Button, Paper, Text } from '@mantine/core';
import './totalsummary.css';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { IconDownload } from '@tabler/icons-react';

interface TotalSummaryProps {
  parsedData: ParsedData;
  names: string;
  nameMatrixHook: [NameMatrix, Dispatch<SetStateAction<NameMatrix>>];
  nameHook: [NameInfo[], Dispatch<SetStateAction<NameInfo[]>>];
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
  const [names, setNames] = nameHook;
  const [nameMatrix, setNameMatrix] = nameMatrixHook;
  const allNames = useMemo(
    () =>
      Object.values(nameMatrix).reduce((acc, nameSet) => {
        return new Set([...acc, ...nameSet]);
      }, new Set()),
    [nameMatrix],
  );
  console.log(parsedData.items);
  console.log('nameMatrix', nameMatrix);

  // const [selectedTaxType, setSelectedTaxType] = taxTypeHook;
  // const [selectedTipType, setSelectedTipType] = tipTypeHook;
  // const [taxValue, setTaxValue] = taxValueHook;
  // const [tipValue, setTipValue] = tipValueHook;

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
  const total = noTaxNoTip + parseFloat(taxAmount) + parseFloat(tipAmount);

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

  const amountEachPersonOwes = useMemo(() => {
    let total = 0;
    const eachPersonDiv = Object.entries(personCost).map(([nameID, amount]) => {
      const percentageOfTotal = amount / noTaxNoTip;
      const taxPortion = parseFloat(taxAmount) * percentageOfTotal;
      const tipPortion = parseFloat(tipAmount) * percentageOfTotal;
      const nameInfo = names.find((name) => name.id === nameID);
      const totalForPerson = amount + taxPortion + tipPortion;
      total += totalForPerson;
      return (
        <div>
          {nameInfo?.name} - ${(amount + taxPortion + tipPortion).toFixed(2)}
        </div>
      );
    });
    return (
      <>
        <div>{eachPersonDiv}</div>
        <Text classNames={{root: 'total-text'}}fw={700}>Total - {total.toFixed(2)}</Text>
      </>
    );
  }, [names, taxValueHook, tipValueHook, taxTypeHook, tipTypeHook]);

  const handleDownloadClick = () => {
    const subTotalText = `Subtotal: $${noTaxNoTip.toFixed(2)}\n`;
    const taxText = `Tax: $${taxAmount}\n`;
    const tipText = `Tip: $${tipAmount}\n`;
    const totalText = `Total: $${total}\n\n`;
    const perPersonText = 'Amount each person owes:\n\n';
    const startingText =
      subTotalText + taxText + tipText + totalText + perPersonText;
    let lineItemStrings = '';
    console.log('allNames', allNames);
    allNames.forEach((nameID) => {
      console.log(nameID);
      console.log('names', names);
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
      const taxPortion = (parseFloat(taxAmount) * percentageOfTotal).toFixed(2);
      lineItemStrings += `Taxes: $${taxPortion}\n`;
      const tipPortion = (parseFloat(tipAmount) * percentageOfTotal).toFixed(2);
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
    <div className="flex gap-10 justify-around w-[70rem]">
      <Paper
        shadow="xl"
        radius="xl"
        withBorder
        p="xl"
        classNames={{ root: 'paper' }}
      >
        <Text>Subtotal: ${noTaxNoTip.toFixed(2)}</Text>
        <Text>Tax: ${taxAmount.toFixed(2)}</Text>
        <Text>Tip: ${tipAmount.toFixed(2)}</Text>
        <Text classNames={{root: 'total-text'}} fw={700}>Total: ${total.toFixed(2)}</Text>
      </Paper>
      <Paper
        shadow="xl"
        radius="xl"
        withBorder
        p="xl"
        classNames={{ root: 'paper' }}
      >
        <Text classNames={{root: 'amountEachPersonOwesText'}} fw={700}>Amount each person owes: </Text>
        <Text>{amountEachPersonOwes}</Text>
        
      </Paper>
      <Button
        onClick={handleDownloadClick}
        rightSection={<IconDownload size={14} />}
        color='black'>
        Download Detailed Summary
      </Button>
    </div>
  );
}

export default TotalSummary;
