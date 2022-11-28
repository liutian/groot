import { UserOutlined, EnvironmentOutlined, MailOutlined } from '@ant-design/icons';
import { ComponentSlot } from '@grootio/react-parser';
type PropType = {
  name: string,
  address: string,
  email: string,
  avatar: React.ReactElement[]
}

const Profile: React.FC<PropType> = (props) => {
  return <>
    <ComponentSlot children={props.avatar} />
    <hr />
    <UserOutlined /> {props.name} <br />
    <EnvironmentOutlined /> {props.address} <br />
    <MailOutlined /> {props.email}
  </>
}

export default Profile;