import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { Pill, PillsInput } from '@mantine/core';
import './names.css';
import type { NameMatrix } from '../types/results';
interface NameProps {
  nameHook: [NameInfo[], Dispatch<SetStateAction<NameInfo[]>>];
  nameMatrixHook: [NameMatrix, Dispatch<SetStateAction<NameMatrix>>];
  handleNameRemove: (idxToRemove: string) => () => void;
}

type NameInfo = {
  id: string;
  name: string;
};

function Names({ nameHook, handleNameRemove }: NameProps) {
  const [currentName, setCurrentName] = useState('');
  const [enteredNames, setEnteredNames] = nameHook;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event?.currentTarget?.value.trimStart();
    if (inputValue === undefined) return;
    if (inputValue.endsWith(' ')) {
      const newNameID = crypto.randomUUID(); 
      setEnteredNames((prev) => [
        ...prev,
        { id: newNameID, name: inputValue.split(' ')[0] },
      ]);
      setCurrentName('');
    } else {
      setCurrentName(inputValue);
    }
  };

  const pills = enteredNames?.map((nameInfo) => (
    <Pill
      key={nameInfo.id}
      withRemoveButton
      onRemove={handleNameRemove(nameInfo.id)}
    >
      {nameInfo.name}
    </Pill>
  ));

  return (
    <div className="names-container">
      <p className="names-label">
        Who's splitting? <span className="names-hint">type a name then press space</span>
      </p>
      <PillsInput classNames={{ wrapper: enteredNames.length === 0 ? 'wrapper wrapper--empty' : 'wrapper', input: 'input' }} w={'100%'}>
        <Pill.Group>
          {pills}
          <PillsInput.Field
            placeholder={enteredNames.length === 0 ? "e.g. Kojo Jason Celia..." : undefined}
            value={currentName}
            onChange={handleChange}
          />
        </Pill.Group>
      </PillsInput>
    </div>
  );
}

export default Names;
