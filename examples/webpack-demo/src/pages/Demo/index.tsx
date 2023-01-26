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
  },
  hostConfig: {
    viewportMode: ViewportMode.H5,
    plugin: (controlType) => {
      return {
        // propSettingView: [{
        //   package: 'approve',
        //   title: '配置项',
        //   url: 'http://groot-local.com:12000/groot-core-plugin/index.js',
        //   module: 'FormulaPropItem'
        // }],
        sidebarView: [{
          key: 'state-list',
          title: 'state列表',
          icon: 'CodeOutlined',
          view: {
            package: 'GrootCorePlugin',
            title: 'state列表',
            url: 'http://groot-local.com:12000/groot-core-plugin/index.js',
            module: 'StateList'
          }
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
