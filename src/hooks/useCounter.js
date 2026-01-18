import {useState} from 'react';



export const useCounter = () => {

const [counter, setCounter] = useState(1);

const changeCounter = (param) => {
  setCounter((prev) => {
    if (param === "inc") return prev + 1;
    if (param === "dec") return Math.max(0, prev - 1); // optional guard
    return prev;
  });
};


return {counter, changeCounter, setCounter};
};

