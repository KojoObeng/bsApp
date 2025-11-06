import type { NameInfo, NameMatrix, ParsedData } from '../types/results';
import cx from 'clsx';
import { Checkbox, CloseButton, ScrollArea, Table } from '@mantine/core';
import './receipttable.css';
import { use, useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

interface ReceiptTableProps {
  parsedData: ParsedData;
  names: NameInfo[];
  nameMatrixHook: [NameMatrix, Dispatch<SetStateAction<NameMatrix>>];
}

export function ReceiptTable({
  parsedData,
  names,
  nameMatrixHook,
}: ReceiptTableProps) {
  const [nameMatrix, setNameMatrix] = nameMatrixHook;

  const itemHeaders = ['Name', 'Quantity', 'Price ($)', 'Total ($)'];
  const allNames = useMemo(
  () => names.map(nameInfo => nameInfo.id),
  [names]
);
  const [everyoneSetForItem, seteveryoneSetForItem] = useState<Set<string>>(new Set<string>());

  useEffect(() => {
    everyoneSetForItem.forEach(itemID => {
      setNameMatrix((prev) => {
      const updated =  { ...prev, [itemID]: new Set<string>(allNames) }
      return updated;
    });
    });
  }, [names]);

  const headers = [
    ...itemHeaders,
    'Everyone',
    ...names.map((nameInfo) => nameInfo.name),
  ].map((name, idx) => {
    return <Table.Th key={idx}>{name}</Table.Th>;
  });

  const onCheckboxChange = (checkboxID: string, isChecked: boolean) => {
    const [itemID, nameID] = checkboxID.split('|');
    console.log(itemID, nameID, isChecked);

    setNameMatrix((prev) => {
      const updated = { ...prev };
      if (isChecked) {
        if (!updated[itemID]) updated[itemID] = new Set<string>();
        updated[itemID]?.add(nameID);
      } else {
        updated[itemID]?.delete(nameID)
        if (updated[itemID].size === 0) delete updated[itemID];
      }
      return updated;
    });
  };

  const onEveryoneCheckboxChange = (itemID: string, isChecked: boolean) => {
    if (isChecked) {
      seteveryoneSetForItem((prev) => prev.add(itemID)) 
    }
    else {
      seteveryoneSetForItem((prev) => new Set([...prev].filter(v => v !== itemID)));
    }
    setNameMatrix((prev) => {
      const updated = isChecked ? { ...prev, [itemID]: new Set<string>(allNames) } : { ...prev, [itemID]: new Set<string>() };
      return updated;
    });
  };


  const rows = parsedData.items.map((item, idx) => {
    const itemID = item.id;
    return (
      <Table.Tr key={idx}>
        <Table.Td>{item.Name}</Table.Td>
        <Table.Td>{item.Quantity}</Table.Td>
        <Table.Td>{item.Price.toFixed(2)}</Table.Td>
        <Table.Td>{(item.Quantity * item.Price).toFixed(2)}</Table.Td>
        <Table.Td> <Checkbox key={itemID} onChange={(event) => onEveryoneCheckboxChange(itemID, event.currentTarget.checked)}/></Table.Td>

        {names.map((nameinfo) => {
          const nameID = nameinfo.id;
          const checkboxID = `${itemID}|${nameID}`;
          return (
            <Table.Td>
              <Checkbox
                key={checkboxID}
                disabled={everyoneSetForItem.has(itemID)}
                indeterminate={everyoneSetForItem.has(itemID)}
                onChange={(event) =>
                  onCheckboxChange(checkboxID, event.currentTarget.checked)
                }
                
              />
            </Table.Td>
          );
        })}
      </Table.Tr>
    );
  });

  return (
    <ScrollArea className="scrollarea">
      <Table
        stickyHeader={true}
        striped
        miw={700}
        stripedColor="gray"
        highlightOnHover={true}
        withRowBorders={false}
        className={cx('table')}
        highlightOnHoverColor="dark"
      >
        <Table.Thead className="header">
          <Table.Tr>{headers}</Table.Tr>
        </Table.Thead>
        <Table.Tbody className="rows">{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export default ReceiptTable;
