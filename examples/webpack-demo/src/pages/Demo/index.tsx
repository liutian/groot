import { Avatar, Button, Input, Select } from 'antd';
import { ProTable } from '@ant-design/pro-table';
import { UIManager } from '@grootio/react';
import { useLocation } from 'react-router';
import react from 'react';
import Profile from 'components/Profile';
import { DateFormItem, EmailFormItem, FormContainer, InputFormItem, MultiDetailFormItem, PhoneFormItem, SelectFormItem } from 'components/FormComponent';

UIManager.init({
  appKey: 'demo',
  appEnv: 'dev',
  serverUrl: 'http://groot-local.com:10000',
  debug: true,
  modules: {
    react,
    antd: {
      Button,
      Input,
      Select,
      Avatar
    },
    '@ant-design/pro-table': {
      ProTable
    },
    app: {
      Profile,
      FormContainer,
      InputFormItem,
      SelectFormItem,
      DateFormItem,
      PhoneFormItem,
      EmailFormItem,
      MultiDetailFormItem
    },
  }
});

function Demo() {
  const location = useLocation();

  return (
    <>
      <UIManager viewKey={location.pathname} />
    </>
  );
}

export default Demo;
