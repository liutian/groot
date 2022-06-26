import React, { ReactNode, useContext, useState } from "react";

const DemoContext = React.createContext<DemoModel>(null);

export const DemoModelProvider: React.FC<{ children: ReactNode[] | ReactNode }> = ({ children }) => {
  const [model, setModel] = useState<DemoModel>(() => {
    return new DemoModel();
  });

  model.refresh = () => {
    const newModel = { ...model } as DemoModel;
    Object.setPrototypeOf(newModel, Object.getPrototypeOf(model));
    setModel(newModel);
  }

  return <DemoContext.Provider value={model}>
    {children}
  </DemoContext.Provider>
}

export const useDemoModel = () => {
  return useContext(DemoContext);
}

class DemoModel {
  refresh() {

  }
  tick = 1;
  change() {
    this.tick++;
    this.refresh();
  }
}


// const ExampleParent: React.FC = () => {
//   return <DemoModelProvider>
//     <ExampleChild />
//   </DemoModelProvider>
// }

// const ExampleChild: React.FC = () => {
//   const model = useDemoModel();
//   return <>
//     <button onClick={() => model.change()}>{model.tick}</button>
//   </>
// }