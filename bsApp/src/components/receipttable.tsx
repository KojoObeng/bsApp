import { Anchor, Group, Progress, Table, Text } from '@mantine/core';
import type { Item, ParsedData } from '../types/results';
import React, { useCallback, useEffect, useRef } from 'react';
import { gridColsClass } from '../util';

interface ReceiptTableProps {
  parsedData: ParsedData;
  names: string[];
}

type SelectedCheckboxes = {
  [key: string]: Set<number>;
};

const generateCheckboxes = (names: string[]) => {
const nameList = names.filter(name => name !== "");
  const checkboxes: SelectedCheckboxes = {};
  nameList.forEach((name, index) => {
    checkboxes[name] = new Set();
  });
  return checkboxes;
}
export function ReceiptTable({ parsedData, names} : ReceiptTableProps) {
    const [checkedCheckboxes, setCheckedCheckboxes] = React.useState<SelectedCheckboxes>(generateCheckboxes(names));
     const prevNames = useRef<string[]>(names);

    useEffect(() => {
        const prevNameList =  prevNames.current.filter(name => name !== "");
        const currNameList = names.filter(name => name !== "");

     if (currNameList.length < prevNameList.length) {
        // name deleted
        // find name deleted
        const deleteName = prevNameList.filter(x => !currNameList.includes(x))[0];
        setCheckedCheckboxes(prev => {
          const newCheckboxes = { ...prev };
          if (newCheckboxes[deleteName]) {
            delete newCheckboxes[deleteName];
          }
          return newCheckboxes;
        });
     }
     else if (currNameList.length > prevNameList.length) {
        // name added
        // find name added

        setCheckedCheckboxes(prev => {
        const addedName = currNameList.filter(x => !prevNameList.includes(x))[0];
          return { ...prev, [addedName]: new Set() };
        })
     }

    prevNames.current = names;
  }, [names]);


    const svgCheckMark = <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>



    const nameList = names.filter(name => name !== "");

    const checkbox2 = useCallback(
  (idxofNameList: number, idxOfItemList: number) => (
    <div className="w-5 h-5 rounded border border-gray-400 peer-checked:bg-green-500 peer-checked:border-green-500 flex items-center justify-center transition-colors">
      {checkedCheckboxes[nameList[idxofNameList]]?.has(idxOfItemList) && svgCheckMark}
    </div>
  ),
  [nameList, checkedCheckboxes]
);
const handleNameCheckboxClick = (idxofNameList: number, idxOfItemList: number) => {
    console.log("clicked", idxofNameList, idxOfItemList);
    const currName = nameList[idxofNameList];
    console.log(currName);
    const currSetOfIndexes = checkedCheckboxes[currName];    
    console.log(currSetOfIndexes);
    if (currSetOfIndexes.has(idxOfItemList)) {
        setCheckedCheckboxes(prev => {
      const newSet = new Set(currSetOfIndexes);
      newSet.delete(idxOfItemList);
      return {...prev, [currName]: newSet};
    })
        }
    else {
        const newSet = new Set(currSetOfIndexes);
        setCheckedCheckboxes(prev => {
            return {...prev, [currName]: newSet.add(idxOfItemList)}
        })
    };
}


    const gridColsStyle = gridColsClass(nameList.length);
      const rows = parsedData.items.map((row, itemIdx) => {
    const  {Name, Price, Quantity } = row
const rowstyle = "text-center border-b border-gray-200 hover:bg-gray-50 transition rounded-lg transition-all duration-50 ease-in-out hover:bg-gray-600 hover:scale-[1.02] hover:shadow-md font-light h-[4rem] text-xs flex items-center justify-center" ;



return (
    <React.Fragment key={itemIdx}>
  <div className={rowstyle}>{Name}</div>
  <div className={rowstyle} contentEditable suppressContentEditableWarning={true}>{Quantity}</div>
  <div className={rowstyle} contentEditable suppressContentEditableWarning={true}>{Price}</div>
  <div className={`${rowstyle} border-r border-gray-300`} contentEditable suppressContentEditableWarning={true}>{Quantity*Price}</div>
  {nameList.map((name, nameIdx) => {
   return  <div onClick={() => handleNameCheckboxClick(nameIdx, itemIdx)} className={`${rowstyle} cursor-pointer`}>{checkbox2(nameIdx, itemIdx)}</div>

  }
    
)}
  </React.Fragment>)});

const headerStyle = "font-light text-xs truncate text-center rounded-t-lg border-b-2 border-gray-300 shadow-sm flex items-center justify-center h-[4rem] break-all whitespace-normal"
return  (<div className="transition-all animate-slide duration-700 ease-in-out transition-transform opacity-100 w-[60vw]">

<div className={`
grid
       ${gridColsStyle}
      font-bold text-center
      bg-glass-white
      rounded-lg
      backdrop-blur-md
      select-none
      transition-colors duration-300
      hover:bg-glass-white-hover
      truncate
    `}>
{/* Headers */}


    <div className={headerStyle}>Name</div>
    <div className={headerStyle}>Quantity</div>
  <div className={headerStyle}>Price</div>
  <div className={`${headerStyle} border-r border-gray-300`}>Amount</div>
  {nameList.map((name, index) => (
    <div key ={index} className={`${headerStyle} text-blue-200`}><span className="break-words">{name}</span></div>))
    

  }

  {rows}
  </div>
    </div>)

}


export default ReceiptTable;