import { UserOutlined, EnvironmentOutlined, MailOutlined } from '@ant-design/icons';
type PropType = {
  name: string,
  address: string,
  email: string,
  avatar: React.ReactNode
}

const Profile: React.FC<PropType> = (props) => {
  return <>
    {props.avatar}
    <hr />
    <UserOutlined /> {props.name} <br />
    <EnvironmentOutlined /> {props.address} <br />
    <MailOutlined /> {props.email}
  </>
}

export default Profile;