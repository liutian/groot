import { Button, Input, Select } from 'antd';
import { ProTable } from '@ant-design/pro-table';
import { UIManager } from '@grootio/renderer';
import { useLocation } from 'react-router';
import react from 'react';
import * as tslib from 'tslib';
import * as jsxRuntime from 'react/jsx-runtime';

UIManager.init({
  cloudServer: 'http://localhost:3000',
  applicationKey: 'project1',
  debug: true,
  modules: {
    react,
    antd: {
      Button,
      Input,
      Select,
    },
    '@ant-design/pro-table': {
      ProTable
    },
    tslib,
    ['react/jsx-runtime']: jsxRuntime,
  },
});

function Demo() {
  const location = useLocation();

  return (
    <>
      <UIManager path={location.pathname} />
    </>
  );
}

export default Demo;
