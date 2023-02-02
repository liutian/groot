import { StudioParams } from 'typings';
import Instance from './Instance';
import Prototype from './Prototype';

const Studio: React.FC<StudioParams> = (params) => {
  return <>
    {params.prototypeMode ? <Prototype /> : <Instance />}
  </>
}


export default Studio;
