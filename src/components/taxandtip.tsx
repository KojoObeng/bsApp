import { NumberInput, SegmentedControl, Text } from '@mantine/core';
import './taxandtip.css';

interface TaxAndTipProps {
  taxValueHook: [number, React.Dispatch<React.SetStateAction<number>>],
  tipValueHook: [number, React.Dispatch<React.SetStateAction<number>>],
  taxTypeHook: [string, React.Dispatch<React.SetStateAction<string>>],
  tipTypeHook: [string, React.Dispatch<React.SetStateAction<string>>],
}

function TaxAndTip({
  taxValueHook,
  tipValueHook,
  taxTypeHook,
  tipTypeHook,
}: TaxAndTipProps) {
  const [selectedTaxType, setSelectedTaxType] = taxTypeHook;
  const [selectedTipType, setSelectedTipType] = tipTypeHook;
  const [taxValue, setTaxValue] = taxValueHook;
  const [tipValue, setTipValue] = tipValueHook;

  return (
    <>
      <div className={'flex gap-10 justify-around w-[70rem]'}>
        <div className={'section'}>
          <Text size="sm" fw={500} mb={2}>
            Tax
          </Text>
          <SegmentedControl
            data={['Percentage', 'Amount']}
            value={selectedTaxType}
            transitionDuration={200}
            transitionTimingFunction="linear"
            onChange={setSelectedTaxType}
          ></SegmentedControl>
          <NumberInput
            value={taxValue}
            placeholder="Tax"
            hideControls
            decimalScale={2}
            allowNegative={false}
            fixedDecimalScale
            onChange={() => setTaxValue}
          />
        </div>
        <div className={'section'}>
          <Text size="sm" fw={500} mb={2}>
            Tip
          </Text>
          <SegmentedControl
            data={['Percentage', 'Amount']}
            value={selectedTipType}
            transitionDuration={200}
            transitionTimingFunction="linear"
            onChange={setSelectedTipType}
          ></SegmentedControl>
          <NumberInput
            value={tipValue}
            hideControls
            decimalScale={2}
            allowNegative={false}
            fixedDecimalScale
            onChange={() => setTipValue}
          />
        </div>
      </div>
    </>
  );
}

export default TaxAndTip;
