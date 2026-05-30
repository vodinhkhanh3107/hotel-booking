import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  theme,
  Avatar,
  Typography,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Modal,
  App as AntApp,
  Space,
  Form,
  Input,
  Divider,
  Upload,
  Image,
  message,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
  LockOutlined,
  VerifiedOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// IMPORT CLOUDINARY & MOCK DATA
import CloudinaryUpload from "../../components/common/CloudinaryUpload";
import { MOCK_USERS } from "../../constants/mockData.jsx";
import { useCookies } from "react-cookie";
import { AccountApiClient } from "../../services/apiClient.jsx";
import dayjs from "dayjs";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;



const Profile = () => {
  const [cookies, _, removeCookie] = useCookies(["user"]);
  const [user,setUser] = useState();
  

  const navigate = useNavigate();
  const { message: antdMessage, modal: antdModal } = AntApp.useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [formUpdate] = Form.useForm();
  const [formPassword] = Form.useForm();
  const avartarPreview = Form.useWatch("avartar",formUpdate);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);


  useEffect(() => {
    const id_user = cookies.user.id
    if (!id_user) {
      navigate("/login");
    };

    const fetchApi = async () => {
      const myProfile = await AccountApiClient.myAccount(id_user);
      console.log(myProfile)
      if(myProfile.status >= 400){
        setLoading(true);
        return antdMessage.error(myProfile.message);
      }
      setLoading(false);
      setUser(myProfile.account);
    }
    fetchApi();
  }, [ cookies.user.id, navigate, antdMessage,loading]);


  const handleUpdateProfile = async (values) => {
    try{
      const res = await AccountApiClient.updateInfo(user._id,values);
      console.log(res);
      if(res.status >= 400){
        message.error(res.message);
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success(res.message);
        setIsUpdateModalOpen(false);
      }, 1000);
    }
    catch(error){
      message.error("Lỗi hệ thống!");
      return;
    }
  };

  const handleLogout = () => {
    antdModal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có muốn thoát khỏi tài khoản không?",
      okText: "Đăng xuất",
      okType: "danger",
      onOk: () => {
        removeCookie("id_user");
        navigate("/");
      },
    });
  };

  const handleChangePassword = async(values) => {
    console.log(values);
    if (!values.current_password || values.current_password === "") {
      return antdMessage.error("Hãy nhập mật khẩu hiện tại");
    }
    if (values.new_password !== values.confirm_password) {
      return antdMessage.error("Mật khẩu xác nhận chưa khớp");
    }
    const response = await AccountApiClient.changePassword(user._id,values);
    if(response.status >= 400){
      antdMessage.error(response.message);
      return;
    }

    antdMessage.success(response.message);
    setIsPasswordModalOpen(false);
    
  }

  const renderUserInfo = () => (
    <Card bordered={false} style={{ borderRadius: borderRadiusLG }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          <UserOutlined /> Thông tin cá nhân
        </Title>
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => {
              formUpdate.setFieldsValue(user);
              setIsUpdateModalOpen(true);
            }}
          >
            Sửa hồ sơ
          </Button>
          <Button
            icon={<LockOutlined />}
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Đổi mật khẩu
          </Button>
        </Space>
      </div>
      <Divider />
      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} md={8} style={{ textAlign: "center" }}>
          <Avatar
            size={140}
            src={user.avartar}
            icon={<UserOutlined />}
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          />
          <Title level={3} style={{ marginTop: 16 }}>
            {user.full_name}
          </Title>
          <Space>
            <Tag color="blue">{user.role}</Tag>
            <Tag color="green" icon={<VerifiedOutlined />}>
              {user.status === "active" ? "Đang hoạt động" : ""}
            </Tag>
          </Space>
        </Col>
        <Col xs={24} md={16}>
          <Descriptions
            column={1}
            bordered
            labelStyle={{ fontWeight: "bold", width: "140px" }}
          >
            <Descriptions.Item label="Email">
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label="Điện thoại">
              {user.phone || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tham gia">
              {dayjs(user.createdAt).format("DD-MM-YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {user.address ? user.address : "Không có"}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );

  return (
    (!loading || user) && (
      <>
        <Layout
          style={{
            minHeight: "85vh",
            background: "#f5f5f5",
            borderRadius: borderRadiusLG,
            overflow: "hidden",
          }}
        >
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            width={220}
            style={{ borderRight: "1px solid #f0f0f0" }}
          >
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              {!collapsed && (
                <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                  TÀI KHOẢN
                </Text>
              )}
            </div>
            <Menu
              mode="inline"
              defaultSelectedKeys={["info"]}
              onClick={({ key }) => key === "logout" && handleLogout()}
              items={[
                {
                  key: "info",
                  icon: <UserOutlined />,
                  label: "Thông tin cá nhân",
                },
                { type: "divider" },
                
              ]}
            />
          </Sider>

          <Layout>
            <Header
              style={{
                background: colorBgContainer,
                padding: 0,
                display: "flex",
                alignItems: "center",
                height: 64,
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ width: 64, height: 64 }}
              />
            </Header>

            <Content style={{ margin: "20px", minHeight: 280 }}>
              {renderUserInfo()}
            </Content>
          </Layout>

          <Modal
            title="Cập nhật hồ sơ"
            open={isUpdateModalOpen}
            onCancel={() => setIsUpdateModalOpen(false)}
            onOk={() => formUpdate.submit()}
            confirmLoading={loading}
            okText="Lưu lại"
            cancelText="Hủy"
          >
            <Form
              form={formUpdate}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                name="full_name"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item name="phone" label="Số điện thoại">
                <Input size="large" />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input size="large" />
              </Form.Item>

              <Form.Item label="Ảnh đại diện" name="avartar">
                <Space direction="vertical" style={{ width: "100%" }}>
                  {/* Tích hợp Cloudinary */}
                  <CloudinaryUpload
                    onUploadSuccess={(url) => {
                      formUpdate.setFieldValue("avartar",url);
                    }}
                  />
                </Space>

                {avartarPreview && (
                  <div style={{ marginTop: 16 }}>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: 8 }}
                    >
                      Xem trước:
                    </Text>
                    <Image
                      src={avartarPreview}
                      width={100}
                      height={100}
                      style={{
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #f0f0f0",
                      }}
                    />
                  </div>
                )}
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Đổi mật khẩu"
            open={isPasswordModalOpen}
            onCancel={() => setIsPasswordModalOpen(false)}
            onOk={() => formPassword.submit()}
            confirmLoading={loading}
          >
            <Form 
              layout="vertical" 
              form={formPassword}
              onFinish={handleChangePassword}
              >
              <Form.Item label="Mật khẩu hiện tại" required name="current_password" >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item label="Mật khẩu mới" required name="new_password" >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item label="Xác nhận mật khẩu mới" required name="confirm_password" >
                <Input.Password size="large" />
              </Form.Item>
            </Form>
          </Modal>
        </Layout>
      </>
    )
  );
};

export default Profile;
