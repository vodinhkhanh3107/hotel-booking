import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Avatar,
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Input,
  App as AntApp,
  Row,
  Col,
  Divider,
  Upload,
} from "antd";
import {
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  EditOutlined,
  IdcardOutlined,
  CalendarOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// Import Cloudinary
import CloudinaryUpload from "../../components/common/CloudinaryUpload";
import { MOCK_HOTELS } from "../../constants/mockData.jsx";
import {
  AccountApiPartner,
  AuthApiPartner,
} from "../../services/apiPartner.jsx";
import { useCookies } from "react-cookie";
import { formatDate } from "../../helpers/date.js";

const { Title, Text } = Typography;

const PartnerProfile = () => {
  const [loading,setLoading] = useState(false);
  const [partner, setPartner] = useState({});
  const [cookies, _] = useCookies();
  const { message } = AntApp.useApp();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const avartarPreview = Form.useWatch("avartar",editForm);

  const [imageUrl, setImageUrl] = useState("");

  const id_partner = cookies.partner.id;
  useEffect(() => {
    const fetchApi = async () => {
      const res = await AccountApiPartner.myAccount(id_partner);
      if (res.status >= 400) {
        message.error(res.message);
        return;
      }

      setPartner(res.account);
    };

    fetchApi();

  }, [id_partner, message,loading]);

  const handleUpdateProfile = async (values) => {
    const res = await AccountApiPartner.updateInfo(id_partner,values);
    if(res.status >= 400){
      message.error(res.message);
      return;
    }
    message.success(res.message);
    setLoading(true);
    setTimeout(() => {
      setIsEditModalVisible(false);
      setLoading(false);
    }, 1000);
  };

  const handlePasswordChange = async (values) => {
    if (!values.current_password || values.current_password === "") {
      return message.error("Hãy nhập mật khẩu hiện tại");
    }
    if (values.new_password !== values.confirm_password) {
      return message.error("Mật khẩu xác nhận chưa khớp");
    }
    const response = await AccountApiPartner.changePassword(partner._id, values);

    if (response.status >= 400) {
      message.error(response.message);
      return;
    }
    message.success(response.message);
    setIsPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  const handleSetValuesform = () => {
    console.log(avartarPreview)
    setIsEditModalVisible(true);
    editForm.setFieldsValue(partner)
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        title={
          <Space>
            <ShopOutlined style={{ color: "#1890ff", fontSize: "22px" }} />
            <Title level={4} style={{ margin: 0 }}>
              Hồ sơ Đối tác doanh nghiệp
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={handleSetValuesform}
            >
              Cập nhật thông tin
            </Button>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={() => setIsPasswordModalVisible(true)}
            >
              Đổi mật khẩu
            </Button>
          </Space>
        }
      >
        <Row gutter={[48, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 24,
                gap: 20,
              }}
            >
              <Avatar
                size={80}
                src={partner.avartar}
                style={{ border: "3px solid #e6f7ff" }}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {partner.full_name}
                </Title>
                <div style={{ marginTop: 8 }}>
                  {partner.status === "active" ? (
                    <Tag color="green" icon={<SafetyCertificateOutlined />}>
                      Đang hoạt động
                    </Tag>
                  ) : (
                    <Tag color="red" icon={<LockOutlined />}>
                      Đã khóa
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            <Descriptions
              column={1}
              labelStyle={{ fontWeight: "500", color: "#8c8c8c" }}
            >
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined /> Email liên hệ
                  </span>
                }
              >
                {partner.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <PhoneOutlined /> Số điện thoại
                  </span>
                }
              >
                {partner.phone || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <IdcardOutlined /> Mã số thuế
                  </span>
                }
              >
                <Text code>{partner.id_tax || "Chưa cập nhật"}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} md={12} style={{ borderLeft: "1px solid #f0f0f0" }}>
            <Title level={5} style={{ marginBottom: 20, color: "#1890ff" }}>
              Thông tin cơ sở quản lý
            </Title>

            <Descriptions
              column={1}
              labelStyle={{ fontWeight: "500", color: "#8c8c8c" }}
            >
              <Descriptions.Item label="Tên cơ sở">
                <Text strong>
                  {partner?.name_bussiness || "Đang cập nhật..."}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <EnvironmentOutlined /> Địa chỉ
                  </span>
                }
              >
                {partner?.address_bussiness || "Đang cập nhật địa chỉ..."}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined /> Ngày gia nhập
                  </span>
                }
              >
                {partner.createdAt ? formatDate(partner.createdAt) : ""}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Phạm vi quản lý">
                <Tag color="blue">
                  {partner?.type?.toUpperCase() || "HOTEL"}
                </Tag>
              </Descriptions.Item> */}
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Cập nhật thông tin đối tác"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        centered
        loading={loading}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item
            name="full_name"
            label="Tên người đại diện"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="id_tax" label="Mã số thuế">
            <Input />
          </Form.Item>

          <Form.Item label="Ảnh đại diện" name="avartar">
            <Space direction="vertical" style={{ width: "100%" }}>
              {/* Tích hợp Cloudinary */}
              <CloudinaryUpload onUploadSuccess={(url) => {
                editForm.setFieldValue("avartar",url)
                setImageUrl(url)
              }} />

              {(
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Xem trước:</Text>
                  <br />
                  <Avatar
                    shape="square"
                    size={64}
                    src={avartarPreview || partner.avartar}
                  />
                </div>
              )}
            </Space>
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu lại
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        footer={null}
        centered
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="current_password"
            label="Mật khẩu cũ"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="Xác nhận mật khẩu"
            dependencies={["newPass"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsPasswordModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnerProfile;
