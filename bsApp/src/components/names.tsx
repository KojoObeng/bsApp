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

function Names({ nameHook, nameMatrixHook, handleNameRemove }: NameProps) {
  const [currentName, setCurrentName] = useState('');
  const [enteredNames, setEnteredNames] = nameHook;
  const [nameMatrix, setNameMatrix] = nameMatrixHook; 

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event?.currentTarget?.value.trimStart();
    if (!inputValue) return;
    if (inputValue.endsWith(' ')) {
      const newNameID = crypto.randomUUID(); 
      console.log('Adding name:', newNameID);
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
    <PillsInput classNames={{ wrapper: 'wrapper', input: 'input' }}>
      <Pill.Group>
        {pills}
        <PillsInput.Field
          placeholder="enter names separated by spaces..."
          value={currentName}
          onChange={handleChange}
        />
      </Pill.Group>
    </PillsInput>
  );
}

export default Names;
