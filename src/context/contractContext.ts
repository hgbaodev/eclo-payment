import React, { createContext, ReactNode } from 'react';

interface MyContextType {
    function1: () => void;
    function2: (param1: string, param2: string) => void;
}

const MyContext = createContext<MyContextType>({
    function1: () => { },
    function2: (param1, param2) => { },
});

interface MyProviderProps {
    children: ReactNode;
}

function MyProvider({ children }: MyProviderProps) {
    const function1 = () => {
        console.log("Function 1 được gọi");
    };

    const function2 = (param1: string, param2: string) => {
        console.log("Function 2 được gọi với tham số:", param1, param2);
    };

    const contextValue: MyContextType = {
        function1,
        function2,
    };

    return (
        <MyContext.Provider value= { contextValue } >
        { children }
        </MyContext.Provider>
    );
}

export { MyContext, MyProvider };
