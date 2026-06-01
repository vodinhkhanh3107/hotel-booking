import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, App as AntApp, Modal, Typography, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ShopOutlined,
  MessageOutlined,
  ExclamationCircleFilled,
  UnorderedListOutlined,
  TagOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { OrderApiPartner } from '../../services/apiPartner';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

const PartnerLayout = () => {
  const [pending_count, set_pending_count] = useState(0);
  const [loading,setLoading] = useState(false);

  const [cookies,_,removeCookie] = useCookies(["partner"]); 

  const [collapsed, setCollapsed] = useState(false);
  
  
  const [newMessageCount, setNewMessageCount] = useState(() => {
    return parseInt(localStorage.getItem('unread_messages_count')) || 0;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { message } = AntApp.useApp();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  // 2. Kiểm tra quyền truy cập
  const id_partner = cookies.partner.id;
  

  useEffect(() => {
    const fetchApi = async () => {
      const res = await OrderApiPartner.getAllOrder(id_partner,"PENDING");
      if(res.status === 200){
        set_pending_count(res.orders.length);
      }
    }
    fetchApi();
    
  },[location,id_partner]);
  

  const handle_logout = () => {
    confirm({
      title: 'Xác nhận đăng xuất',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc chắn muốn thoát khỏi hệ thống đối tác?',
      okText: 'Đăng xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        removeCookie("partner");
        message.success('Đã đăng xuất thành công!');
        window.location.href = "/partner/login"
      },
    });
  };

  const user_menu_items = [
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handle_logout,
    },
  ];

  // 5. Cấu hình Menu Items với Badge
  const menu_items = [
    { key: '/partner/dashboard', icon: <BarChartOutlined />, label: 'Báo cáo doanh thu' },
    { key: '/partner/profile', icon: <ProfileOutlined />, label: 'Hồ sơ cá nhân' },
    { key: '/partner/hotels', icon: <ShopOutlined />, label: 'Quản lý khách sạn' },
    { key: '/partner/rooms', icon: <HomeOutlined />, label: 'Quản lý loại phòng' },
    { key: '/partner/roomnumbers', icon: <UnorderedListOutlined />, label: 'Quản lý phòng' },
    { 
      key: '/partner/bookings', 
      icon: <CalendarOutlined />, 
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Đơn đặt phòng</span>
          {pending_count > 0 && (
            <Badge 
              count={pending_count} 
              size="small" 
              style={{ backgroundColor: '#f5222d' }} 
            />
          )}
        </div>
      ) 
    },
    { key: '/partner/discounts', icon: <TagOutlined />, label: 'Mã giảm giá' }, 
    { 
      key: '/partner/messages', 
      icon: <MessageOutlined />, 
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Nhắn tin</span>
          {newMessageCount > 0 && (
            <Badge 
              count={newMessageCount} 
              size="small" 
              style={{ backgroundColor: '#f5222d' }} 
            />
          )}
        </div>
      )
    },
  ];

  const fetchPendingCount = async () => {
   try {
     const res = await OrderApiPartner.getAllOrder(id_partner,"PENDING");
     if (res.status === 200) {
       set_pending_count(res.orders.length);
       setTimeout(() => {
        setLoading(!loading);
       }, 1000);
     }
   } catch (error) {
     console.log(error)
     message.error("Lỗi cập nhật số lượng chờ duyệt");
   }
 };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={250}
        style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#001529',
          borderBottom: '1px solid #1d39c4'
        }}>
          <div style={{ color: '#1890ff', fontWeight: 'bold', fontSize: collapsed ? 16 : 18 }}>
            {collapsed ? 'PH' : 'PARTNER HOTEL'}
          </div>
          {!collapsed && (
            <div style={{ color: '#8c8c8c', fontSize: 10, textTransform: 'uppercase' }}>
              Kênh đối tác
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menu_items}
        />
      </Sider>

      <Layout style={{ height: '100vh' }}>
        <Header style={{
          padding: 0,
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 24,
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Dropdown menu={{ items: user_menu_items }} placement="bottomRight" arrow>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '0 12px' }}>
              <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                <Text strong style={{ display: 'block' }}>
                  {cookies.partner.full_name}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {cookies.partner.role?.toUpperCase()}
                </Text>
              </div>
              <Avatar 
                style={{ backgroundColor: '#1890ff' }} 
                src={cookies.partner.avatar} 
                icon={<UserOutlined />} 
              />
            </div>
          </Dropdown>
        </Header>

        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: colorBgContainer, 
          borderRadius: borderRadiusLG,
          flex: 1,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}>
          <Outlet context={ { fetchPendingCount } }/>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PartnerLayout;