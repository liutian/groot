import { Button, Input, Select } from 'antd';
import { PageManager } from '@groot/runtime';
import { useLocation } from 'react-router';
import react from 'react';
import * as tslib from 'tslib';
import * as jsxRuntime from 'react/jsx-runtime';

PageManager.config({
  server: 'demo',
  // lazyLoadWorker: false,
  debug: true,
  modules: {
    react,
    antd: {
      Button,
      Input,
      Select,
    },
    tslib,
    ['react/jsx-runtime']: jsxRuntime,
  },
});

function Demo() {
  const location = useLocation();

  return (
    <>
      <PageManager path={location.pathname.replace(/^\/admin/, '')} />
    </>
  );
}

export default Demo;
