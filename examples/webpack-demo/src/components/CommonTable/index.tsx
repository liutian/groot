import { ParamsType } from '@ant-design/pro-provider';
import ProTable, { ProTableProps } from '@ant-design/pro-table';

const CommonTable = <
  T extends Record<string, any>,
  U extends ParamsType = ParamsType,
  ValueType = 'text',
  >(
    props: ProTableProps<T, U, ValueType>,
) => {
  return <ProTable {...props} />;
};

export default CommonTable;
