import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App as AntApp } from 'antd';
import { LockOutlined, UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../../constants/mockData.jsx';
import { authApiAdmin } from '../../services/apiAdmin.jsx';
import { useCookies } from 'react-cookie';

const { Title, Text } = Typography;

const AdminLogin = () => {

  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = AntApp.useApp();

  const [cookies,setCookie] = useCookies();

  const handleNavigation = (account) => {
    message.success(`Chào mừng quản trị viên ${account.full_name} quay trở lại`);
    setCookie("admin",account);
    navigate("/admin/dashboard");
  }

  const onFinish = async (values) => {
    const { email, password } = values;

    const res = await authApiAdmin.login({ email, password });
    console.log(res);
    if(res.status >= 400){
      return message.error(res.message);
    }

    setLoading(true);
    message.success(res.message);
    setTimeout(() => handleNavigation(res.account),1000)
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyCertificateOutlined style={{ fontSize: 40, color: '#ff4d4f' }} />
          <Title level={3} style={{ marginTop: 12 }}>ADMIN LOGIN</Title>
          <Text type="secondary">Hệ thống quản trị</Text>
        </div>

        <Form name="admin_login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item 
            name="email"
            label="Tài khoản hoặc Email"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản hoặc email!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username hoặc email admin" 
            />
          </Form.Item>

          <Form.Item 
            name="password" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              danger
              style={{ height: 45, fontWeight: 'bold' }}
              loading={loading}
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" italic>Chỉ dành cho quản trị viên hệ thống</Text>
        </div>
      </Card>
    </div>
  );
};

// Styles
const containerStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '100vh', 
  background: '#f0f2f5' 
};

const cardStyle = { 
  width: 400, 
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
  borderRadius: 8,
  borderTop: '5px solid #ff4d4f'
};

export default AdminLogin;