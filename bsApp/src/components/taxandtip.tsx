import { SegmentedControl, TextInput } from '@mantine/core';
import { useState } from 'react';

interface TaxAndTipProps {
  taxValue: number;
  tipValue: number;
}


function TaxAndTip({ taxValue, tipValue }: TaxAndTipProps) {
    const [selected, setSelected] = useState('percentage');;
    const [isTipPercentage, setIsTipPercentage] = useState<boolean>(true);
    const [taxValue2, setTaxValue] = useState<number>(taxValue);
    const [tipValue2, setTipValue] = useState<number>(tipValue);

  return (
    <>

    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md w-fit">
      {['percentage', 'amount'].map((option) => (
        <label
          key={option}
          className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium border transition-all 
            ${
              selected === option
                ? 'bg-green-500 text-white border-green-500 shadow-sm'
                : 'bg-transparent text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600'
            }`}
        >
          <input
            type="radio"
            name="mode"
            value={option}
            checked={selected === option}
            onChange={() => setSelected(option)}
            className="hidden"
          />
          {option === 'percentage' ? 'Percentage' : 'Amount'}
        </label>
      ))}
    </div>
    <TextInput
      label="Tax"
      error="Invalid email"
      defaultValue="hello!gmail.com"
    />
        </>
  );
}


export default TaxAndTip
