import { Avatar, Button, Input, Select } from 'antd';
import { ProTable } from '@ant-design/pro-table';
import { UIManager } from '@grootio/react';
import { useLocation } from 'react-router';
import react from 'react';
import Profile from 'components/Profile';
import { DateFormItem, EmailFormItem, FormContainer, InputFormItem, MultiDetailFormItem, PhoneFormItem, SelectFormItem } from 'components/FormComponent';
import { ViewportMode } from '@grootio/common';

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
      InputFormItem,
      SelectFormItem,
      DateFormItem,
      PhoneFormItem,
      EmailFormItem,
      MultiDetailFormItem
    },
  },
  hostConfig: {
    viewportMode: ViewportMode.H5,
    plugin: (controlType) => {
      return {
        propSettingView: [{
          package: 'approve',
          title: '配置项',
          url: 'http://localhost:10002/groot-plugin/index.js',
          module: 'FormulaPropItem'
        }]
      }
    }
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
