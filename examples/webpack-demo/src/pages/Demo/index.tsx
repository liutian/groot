import { Avatar, Button, Input, Select } from 'antd';
import { ProTable } from '@ant-design/pro-table';
import { UIManager } from '@grootio/react-parser';
import { useLocation } from 'react-router';
import react from 'react';
import Profile from 'components/Profile';
import { DateForm, EmailForm, FormContainer, InputForm, PhoneForm, SelectForm } from 'components/FormComponent';

UIManager.init({
  appKey: 'demo',
  appEnv: 'dev',
  serverUrl: 'http://127.0.0.1:3000',
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
      InputForm,
      SelectForm,
      DateForm,
      PhoneForm,
      EmailForm
    },
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
