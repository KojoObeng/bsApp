import React, { type Dispatch, type SetStateAction } from 'react';
interface NameProps {
  names: string[];
  setNames: Dispatch<SetStateAction<string[]>>;
}

function Names({names, setNames}: NameProps) {
    const placeholdertext = "enter names with spaces ...";
    const [enterPressed, setEnterPressed]= React.useState<boolean>(false);

    const onChange = (e: any) => {
        const trimmedName = (e.currentTarget.textContent || "").trim();

        if (enterPressed) {
            if (!names.includes(trimmedName)) {
                setEnterPressed(false);
                setNames(prev => [...prev, trimmedName]);
                e.currentTarget.textContent ="";

            }
            else {
                setEnterPressed(false);
            }

    }
}

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter")  setEnterPressed(true);
    }

  return (
    <>
    
    <div className="flex justify-center items-center border-1 border-gray-600 rounded-xl bg-transparent text-center focus:outline-none text-xs h-[3rem] w-[100%]" contentEditable spellCheck={false} suppressContentEditableWarning={true} onInput={e => onChange(e)} onKeyDown={handleKeyDown}>
              {/* {names === "" && (
        <span className="absolute text-gray-400 pointer-events-none select-none focus:outline-none ">
         {placeholdertext}
        </span> */}
    </div>
  </>)
}

export default Names
