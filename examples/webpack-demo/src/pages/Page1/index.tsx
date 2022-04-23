import type { ProColumns } from '@ant-design/pro-table';
import CommonTable from 'components/CommonTable';

export default () => {
  return (
    <>
      <CommonTable<TableListItem>
        columns={columns}
        request={() => {
          return Promise.resolve({
            data: createDateSource(),
          });
        }}
        rowKey="key"
      />
    </>
  );
};

const columns: ProColumns<TableListItem>[] = [
  {
    title: '应用名称',
    dataIndex: 'name',
  },
  {
    title: '容器数量',
    dataIndex: 'containers',
  },
  {
    title: '状态',
    dataIndex: 'status',
    initialValue: 'all',
    valueEnum: {
      all: { text: '全部', status: 'Default' },
      close: { text: '关闭', status: 'Default' },
      running: { text: '运行中', status: 'Processing' },
      online: { text: '已上线', status: 'Success' },
      error: { text: '异常', status: 'Error' },
    },
  },
  {
    title: '创建者',
    dataIndex: 'creator',
    valueEnum: {
      all: { text: '全部' },
      付小小: { text: '付小小' },
      曲丽丽: { text: '曲丽丽' },
      林东东: { text: '林东东' },
      陈帅帅: { text: '陈帅帅' },
      兼某某: { text: '兼某某' },
    },
  },
  {
    title: '创建时间',
    key: 'since',
    dataIndex: 'createdAt',
  },
  {
    title: '备注',
    dataIndex: 'memo',
  },
];

function createDateSource() {
  const tableListDataSource: TableListItem[] = [];
  const creators = ['付小小', '曲丽丽', '林东东', '陈帅帅', '兼某某'];
  const valueEnum = {
    0: 'close',
    1: 'running',
    2: 'online',
    3: 'error',
  } as any;

  for (let i = 0; i < 5; i += 1) {
    tableListDataSource.push({
      key: i,
      name: 'AppName',
      containers: Math.floor(Math.random() * 20),
      creator: creators[Math.floor(Math.random() * creators.length)] as string,
      status: valueEnum[Math.floor(Math.random() * 10) % 4],
      createdAt: Date.now() - Math.floor(Math.random() * 100000),
      memo: i % 2 === 1 ? '很长很长很长很长很长很长很长的文字要展示但是要留下尾巴' : '简短备注文案',
    });
  }

  return tableListDataSource;
}

export type TableListItem = {
  key: number;
  name: string;
  containers: number;
  creator: string;
  status: string;
  createdAt: number;
  memo: string;
};
