import { Button, Input, Select } from 'antd';
import { UIManager } from '@groot-elf/runtime';
import { useLocation } from 'react-router';
import react from 'react';
import * as tslib from 'tslib';
import * as jsxRuntime from 'react/jsx-runtime';

UIManager.init({
  cloudServer: 'http://localhost:3000',
  projectKey: 'project1',
  debug: true,
  amd: {
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
  }
});

function Demo() {
  const location = useLocation();

  return (
    <>
      <UIManager path={location.pathname.replace(/^\/admin/, '')} />
    </>
  );
}

export default Demo;
