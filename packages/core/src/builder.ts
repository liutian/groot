export function emitCode(metadata: any): string {
  const codeStore: any = {
    ['/groot/page1']: `
    import React from 'react';
    import { Button } from 'antd';
    
    function Page() {
      return <>
        <Button onClick={() => alert('world')}>${metadata.moduleName}</Button>
      </>;
    }
      
    export default Page;
    `,
    ['/groot/page2']: `
    import React from 'react';
    import { Input } from 'antd';
    
    function Page() {
      return <><Input value={'${metadata.moduleName}'}/></>;
    }
      
    export default Page;
    `,
    ['/groot/page3']: `
    import React from 'react';
    import { Select } from 'antd';
    
    function Page() {
      return <>
        <Select  style={{ width: 120 }} >
        <Select.Option value="jack">Jack</Select.Option>
        </Select>
      </>;
    }
      
    export default Page;
    `,
    notFound: `
    import React from 'react';
    
    function Page() {
      return <>not found</>;
    }
      
    export default Page;
    `,
  };

  return codeStore[metadata.moduleName] || codeStore.notFound;
}
