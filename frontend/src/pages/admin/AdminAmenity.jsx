import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  Switch,
  message,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { ALL_AMENITIES } from "../../constants/mockData.jsx";
import { AmenityApiAdmin } from "../../services/apiAdmin.jsx";
import { capitalize_words } from "../../helpers/capital-word.js";
import useHandleSearch from "../../hooks/useHandleSearch.jsx";

const { Title, Text } = Typography;

const AdminAmenity = () => {
  const { textSearch, handleSearch } = useHandleSearch();


  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số dòng mỗi trang

  const [amenities, setAmenity] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");

  // Khởi tạo dữ liệu
  useEffect(() => {
    const fetchApi = async () => {
      const res = await AmenityApiAdmin.getAllAmenity();
      console.log(res);
      if (res.status >= 400) {
        message.error(res.message);
        return;
      }

      setAmenity(res.amenities);
    };

    fetchApi();
    // const localData = localStorage.getItem('SYSTEM_AMENITIES');
    // if (localData) {
    //   setAmenities(JSON.parse(localData));
    // } else {
    //   setAmenities(ALL_AMENITIES);
    //   localStorage.setItem('SYSTEM_AMENITIES', JSON.stringify(ALL_AMENITIES));
    // }
  }, [loading]);


  const handleSubmit = async (values) => {
    const { name_amenity, status } = values;
    if (editingId) {
      const res = await AmenityApiAdmin.updateAmenity(editingId, {
        name_amenity: capitalize_words(name_amenity),
        status: status ? "active" : "block",
      });

      if (res.status >= 400) {
        
        setLoading(false);
        message.error(res.message);
        return;
      }
      message.success(res.message);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsModalOpen(false);
        form.resetFields();
      }, 1000);
    } else {
      const res = await AmenityApiAdmin.createAmenity({
        name_amenity: capitalize_words(values.name_amenity),
        status: status ? "active" : "block",
      });

      if (res.status >= 400) {
        setLoading(false)
        message.error(res.message);
        return;
      }

      message.success(res.message);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsModalOpen(false);
        form.resetFields();
      }, 1000);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      ...record,
      status: record.status === "active" ? true : false
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleToggleStatus = (record) => {
    const isLocking = record.status === "block";
    const newStatus = record.status === "block" ? "active" : "block"
    const actionText = isLocking ? "mở khóa" : "khóa";

    Modal.confirm({
      title: `Xác nhận ${actionText} tiện nghi?`,
      icon: isLocking ? (
        <LockOutlined style={{ color: "#ff4d4f" }} />
      ) : (
        <UnlockOutlined style={{ color: "#52c41a" }} />
      ),
      content: `Bạn chắc chắn muốn ${actionText} "${record.name_amenity}"?`,
      onOk: async () => {
        const res = await AmenityApiAdmin.changeStatusAmenity(record._id,newStatus);
        if(res.status >=400 ){
          message.error(res.message);
          return;
        }

        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          message.success(res.message);
        }, 1000);
      },
    });
  };


  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      width: 150,
      align: "center",
      render: (_, __, index) => (
        <Text strong>{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: "Tên tiện nghi",
      dataIndex: "name_amenity",
      key: "name_amenity",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (status) => (
        <Tag
          color={status === "active" ? "green" : "red"}
          style={{ fontWeight: 500 }}
        >
          {status === "active" ? "ĐANG HOẠT ĐỘNG" : "ĐANG KHÓA"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>

          <Button
            type="link"
            onClick={() => handleToggleStatus(record)}
            style={{ padding: 0 }}
          >
            <Space size={4}>
              {record.status === "block" ? (
                <>
                  <LockOutlined style={{ color: "#f5222d" }} />
                  <span style={{ color: "#f5222d" }}>Khóa</span>
                </>
              ) : (
                <>
                  <UnlockOutlined style={{ color: "#006efeff" }} />
                  <span style={{ color: "#006efeff" }}>Mở</span>
                </>
              )}
            </Space>
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <AppstoreOutlined /> Quản lý tiện nghi phòng
            </Title>
          </Col>
        </Row>
      </Card>

      <Card variant={false} style={{ borderRadius: 12 }}>
        <Row gutter={16} style={{ marginBottom: 20 }} justify="space-between">
          <Col span={12}>
            <Input
              placeholder="Tìm tên tiện nghi..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e)}
              allowClear
              size="large"
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              size="large"
            >
              Thêm tiện nghi mới
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={amenities.filter(amenity => amenity.name_amenity.toLowerCase().includes(textSearch)) || amenities}
          rowKey="_id"
          pagination={{
            pageSize: pageSize,
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total) => `Tổng cộng ${total} tiện nghi`
          }}
        />
      </Card>

      <Modal
        title={editingId ? "Cập nhật tiện nghi" : "Thêm tiện nghi mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        centered
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true }}
          style={{ marginTop: 10 }}
        >
          <Form.Item
            name="name_amenity"
            label="Tên tiện nghi phòng"
            rules={[
              { required: true, message: "Vui lòng nhập tên tiện nghi!" },
            ]}
          >
            <Input placeholder="VD: Máy sấy tóc, Bồn tắm, Mini bar..." />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái hoạt động"
            valuePropName="checked"
            
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAmenity;
