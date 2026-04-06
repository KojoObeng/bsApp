import type { NameInfo, NameMatrix, ParsedData } from '../types/results';
import { Checkbox, Pill, Popover, Table } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import './receipttable.css';
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';

// --- Mobile select component ---
interface MobileSelectProps {
  itemID: string;
  names: NameInfo[];
  selected: string[];
  onChange: (itemID: string, values: string[]) => void;
}

function MobileSelect({ itemID, names, selected, onChange }: MobileSelectProps) {
  const [opened, setOpened] = useState(false);

  const getLabel = (id: string) =>
    id === 'everyone' ? 'Everyone' : (names.find((n) => n.id === id)?.name ?? id);

  const options = ['everyone', ...names.map((n) => n.id)];

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((v) => v !== id)
      : [...selected, id];
    onChange(itemID, next);
  };

  const displayed = selected.slice(0, 3);
  const extra = selected.length - 3;

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-end" withinPortal>
      <Popover.Target>
        <div className="mobile-select-trigger" onClick={() => setOpened((o) => !o)}>
          {selected.length === 0 ? (
            <span className="mobile-select-placeholder">who shared?</span>
          ) : (
            <>
              {displayed.map((id) => (
                <Pill
                  key={id}
                  size="xs"
                  classNames={{ root: id === 'everyone' ? 'pill-everyone' : 'pill-name' }}
                >
                  {getLabel(id)}
                </Pill>
              ))}
              {extra > 0 && <span className="mobile-select-extra">+{extra} more</span>}
            </>
          )}
        </div>
      </Popover.Target>
      <Popover.Dropdown className="mobile-select-dropdown">
        {options.map((id) => (
          <div
            key={id}
            className={`mobile-select-option${id === 'everyone' ? ' everyone-option' : ''}${selected.includes(id) ? ' selected' : ''}`}
            onClick={() => toggle(id)}
          >
            <span>{getLabel(id)}</span>
            {selected.includes(id) && <span className="mobile-select-check">✓</span>}
          </div>
        ))}
      </Popover.Dropdown>
    </Popover>
  );
}

// --- Main table component ---
interface ReceiptTableProps {
  parsedData: ParsedData;
  names: NameInfo[];
  nameMatrixHook: [NameMatrix, Dispatch<SetStateAction<NameMatrix>>];
  setParsedData: Dispatch<SetStateAction<ParsedData | null>>;
}

export function ReceiptTable({
  parsedData,
  names,
  nameMatrixHook,
  setParsedData,
}: ReceiptTableProps) {
  const [nameMatrix, setNameMatrix] = nameMatrixHook;
  const isMobile = useMediaQuery('(max-width: 640px)');

  const itemHeaders = ['Name', 'Quantity', 'Price ($)', 'Total ($)'];
  const allNames = useMemo(() => names.map((n) => n.id), [names]);
  const [everyoneSetForItem, setEveryoneSetForItem] = useState<Set<string>>(new Set<string>());
  const preEveryoneSnapshot = useRef<Record<string, Set<string>>>({});

  useEffect(() => {
    everyoneSetForItem.forEach((itemID) => {
      setNameMatrix((prev) => ({ ...prev, [itemID]: new Set<string>(allNames) }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names]);

  // --- Desktop handlers ---
  const onCheckboxChange = (checkboxID: string, isChecked: boolean) => {
    const [itemID, nameID] = checkboxID.split('|');
    setNameMatrix((prev) => {
      const updated = { ...prev };
      if (isChecked) {
        if (!updated[itemID]) updated[itemID] = new Set<string>();
        updated[itemID].add(nameID);
      } else {
        updated[itemID]?.delete(nameID);
        if (updated[itemID]?.size === 0) delete updated[itemID];
      }
      return updated;
    });
  };

  const onEveryoneCheckboxChange = (itemID: string, isChecked: boolean) => {
    if (isChecked) {
      preEveryoneSnapshot.current[itemID] = new Set(nameMatrix[itemID] ?? []);
      setEveryoneSetForItem((prev) => new Set([...prev, itemID]));
      setNameMatrix((prev) => ({ ...prev, [itemID]: new Set<string>(allNames) }));
    } else {
      const restored = preEveryoneSnapshot.current[itemID] ?? new Set<string>();
      delete preEveryoneSnapshot.current[itemID];
      setEveryoneSetForItem((prev) => new Set([...prev].filter((v) => v !== itemID)));
      setNameMatrix((prev) => {
        const updated = { ...prev, [itemID]: restored };
        if (restored.size === 0) delete updated[itemID];
        return updated;
      });
    }
  };

  // --- Auto-resize textarea ---
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // --- Item edit handler ---
  const onItemChange = (itemID: string, field: 'Name' | 'Price', value: string) => {
    setParsedData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemID
            ? { ...item, [field]: field === 'Price' ? parseFloat(value) || 0 : value }
            : item
        ),
      };
    });
  };

  // --- Mobile handler ---
  const onMobileChange = (itemID: string, nameIDs: string[]) => {
    const hadEveryone = everyoneSetForItem.has(itemID);
    const hasEveryone = nameIDs.includes('everyone');
    const realIDs = nameIDs.filter((id) => id !== 'everyone');

    if (hasEveryone && !hadEveryone) {
      onEveryoneCheckboxChange(itemID, true);
    } else if (!hasEveryone && hadEveryone) {
      onEveryoneCheckboxChange(itemID, false);
    } else if (hadEveryone && hasEveryone && realIDs.length > 0) {
      delete preEveryoneSnapshot.current[itemID];
      setEveryoneSetForItem((prev) => new Set([...prev].filter((v) => v !== itemID)));
      setNameMatrix((prev) => ({ ...prev, [itemID]: new Set(realIDs) }));
    } else {
      setNameMatrix((prev) => {
        const updated = { ...prev };
        if (realIDs.length === 0) delete updated[itemID];
        else updated[itemID] = new Set(realIDs);
        return updated;
      });
    }
  };

  // --- Desktop layout ---
  const desktopHeaders = [
    ...itemHeaders,
    'Everyone',
    ...names.map((n) => n.name),
  ].map((name, idx) => <Table.Th key={idx}>{name}</Table.Th>);

  const desktopRows = parsedData.items.map((item, idx) => {
    const itemID = item.id;
    return (
      <Table.Tr key={idx}>
        <Table.Td><textarea className="cell-input cell-input--name" value={item.Name} rows={1} ref={autoResize} onInput={(e) => autoResize(e.currentTarget)} onChange={(e) => onItemChange(itemID, 'Name', e.target.value)} /></Table.Td>
        <Table.Td>{item.Quantity}</Table.Td>
        <Table.Td><input className="cell-input cell-input--number" value={item.Price.toFixed(2)} onChange={(e) => onItemChange(itemID, 'Price', e.target.value)} /></Table.Td>
        <Table.Td>{(item.Quantity * item.Price).toFixed(2)}</Table.Td>
        <Table.Td>
          <Checkbox
            checked={everyoneSetForItem.has(itemID)}
            onChange={(e) => onEveryoneCheckboxChange(itemID, e.currentTarget.checked)}
          />
        </Table.Td>
        {names.map((nameInfo) => {
          const checkboxID = `${itemID}|${nameInfo.id}`;
          return (
            <Table.Td key={checkboxID}>
              <Checkbox
                checked={nameMatrix[itemID]?.has(nameInfo.id) ?? false}
                disabled={everyoneSetForItem.has(itemID)}
                indeterminate={everyoneSetForItem.has(itemID)}
                onChange={(e) => onCheckboxChange(checkboxID, e.currentTarget.checked)}
              />
            </Table.Td>
          );
        })}
      </Table.Tr>
    );
  });

  // --- Mobile layout ---
  const mobileHeaders = ['Name', 'Total', 'Shared by'].map((name, idx) => (
    <Table.Th key={idx}>{name}</Table.Th>
  ));

  const mobileRows = parsedData.items.map((item, idx) => {
    const itemID = item.id;
    const selected = everyoneSetForItem.has(itemID)
      ? ['everyone']
      : (nameMatrix[itemID] ? [...nameMatrix[itemID]] : []);
    return (
      <Table.Tr key={idx}>
        <Table.Td><textarea className="cell-input cell-input--name" value={item.Name} rows={1} ref={autoResize} onInput={(e) => autoResize(e.currentTarget)} onChange={(e) => onItemChange(itemID, 'Name', e.target.value)} /></Table.Td>
        <Table.Td>{(item.Quantity * item.Price).toFixed(2)}</Table.Td>
        <Table.Td style={{ overflow: 'visible' }}>
          <MobileSelect
            itemID={itemID}
            names={names}
            selected={selected}
            onChange={onMobileChange}
          />
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table.ScrollContainer w="100%" minWidth={isMobile ? 0 : 520}>
      <Table
        stickyHeader={true}
        striped
        stripedColor="gray"
        highlightOnHover={true}
        withRowBorders={false}
        w="100%"
        highlightOnHoverColor="dark"
      >
        <Table.Thead className="header">
          <Table.Tr>{isMobile ? mobileHeaders : desktopHeaders}</Table.Tr>
        </Table.Thead>
        <Table.Tbody className="rows">{isMobile ? mobileRows : desktopRows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

export default ReceiptTable;
