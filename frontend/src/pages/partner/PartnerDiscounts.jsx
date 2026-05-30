import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  App as AntApp,
  InputNumber,
  Row,
  Col,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  TagOutlined,
  HomeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { MOCK_HOTELS, MOCK_DISCOUNTS } from "../../constants/mockData.jsx";
import {
  HotelApiPartner,
  PromotionApiPartner,
} from "../../services/apiPartner.jsx";

import { useCookies } from "react-cookie";
import useHandleSearch from "../../hooks/useHandleSearch.jsx";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PartnerDiscounts = () => {
  const { textSearch,handleSearch } = useHandleSearch();
  const [cookies, _] = useCookies();
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotion] = useState([]);
  const [hotels, setHotel] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");

  const { message: antdMessage, modal: antdModal } = AntApp.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(); // Trạng thái đang sửa mã nào
  const [form] = Form.useForm();
  const datesPreview = Form.useWatch(form);
  console.log(datesPreview);

  // Khởi tạo thêm status cho mock data nếu chưa có
  const [discounts, setDiscounts] = useState(
    MOCK_DISCOUNTS.map((d) => ({ ...d, status: d.status || "active" })),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const id_partner = cookies.partner.id;
  useEffect(() => {
    const fetchApiHotel = async () => {
      const res = await HotelApiPartner.getAllHotel(id_partner, "APPROVED");
      if (res.status === 200) {
        setHotel(res.hotels);
        setSelectedHotel(res.hotels[0]._id);
      }
    };

    fetchApiHotel();
  }, [id_partner]);

  useEffect(() => {
    const fetchApiPromotion = async () => {
      const res = await PromotionApiPartner.getAllPromotion(
        id_partner,
        selectedHotel,
      );

      if (res.status === 200) {
        setTimeout(() => {
          setPromotion(res.promotions);
        }, 1000);
      }
    };

    fetchApiPromotion();
  }, [id_partner, selectedHotel, loading]);

  // --- LOGIC KHÓA / MỞ KHÓA ---
  const handleToggleLock = (record) => {
    const isCurrentlyLocked = record.blocked;
    const actionText = isCurrentlyLocked ? "mở khóa" : "khóa";

    antdModal.confirm({
      title: `Xác nhận ${actionText} mã giảm giá?`,
      icon: isCurrentlyLocked ? (
        <UnlockOutlined style={{ color: "#52c41a" }} />
      ) : (
        <LockOutlined style={{ color: "#ff4d4f" }} />
      ),
      content: `Bạn chắc chắn muốn ${actionText} mã "${record.code}" chứ?`,
      okText: `Xác nhận ${actionText}`,
      okType: isCurrentlyLocked ? "primary" : "danger",
      onOk: async() => {
        try{
          const res = await PromotionApiPartner.changeStatusPromotion(record._id,isCurrentlyLocked);
          if(res.status >= 400){
            antdMessage.error(res.message);
            return;
          }

          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            antdMessage.success(res.message);
          }, 1000);
        }
        catch(error){
          antdMessage.error("Lỗi hệ thống")
        }
        
        // setDiscounts((prev) =>
        //   prev.map((item) =>
        //     item.id_discount === record.id_discount
        //       ? { ...item, status: isCurrentlyLocked ? "active" : "locked" }
        //       : item,
        //   ),
        // );
        // antdMessage.success(`Đã ${actionText} mã giảm giá thành công!`);
      },
    });
  };

  const handleEdit = (record) => {
    form.setFieldValue("range",[dayjs(record.start_date),dayjs(record.end_date)]);
    setEditingId(record._id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text strong>{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: "Mã Code",
      dataIndex: "code",
      key: "code",
      render: (code) => (
        <Tag color="blue" style={{ fontWeight: "bold" }} icon={<TagOutlined />}>
          {code}
        </Tag>
      ),
    },
    {
      title: "Khách sạn áp dụng",
      dataIndex: "hotel_names",
      key: "hotel_names",
      width: 250,
      render: (list_hotels) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {/* THÊM CHECK MẢNG TẠI ĐÂY */}
          {Array.isArray(list_hotels) &&
            list_hotels.map((hotel) => {
              {
                /* const hotel = MOCK_HOTELS.find(h => h.id_hotel === id); */
              }
              return (
                <Tag icon={<HomeOutlined />} key={hotel} color="cyan">
                  {hotel ? hotel : ""}
                </Tag>
              );
            })}
          {/* {!id_list || id_list.length === 0 ? <Text type="secondary">Tất cả</Text> : null} */}
        </div>
      ),
    },
    {
      title: "Giảm (%)",
      dataIndex: "discount_percent",
      key: "discount_percent",
      align: "center",
      render: (p) => (
        <Text type="danger" strong>
          {p}%
        </Text>
      ),
    },
    {
      title: "Hiệu lực",
      key: "duration",
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          <div>
            <Text type="secondary">Từ:</Text>{" "}
            {dayjs(record.start_date).format("DD/MM/YYYY")}
          </div>
          <div>
            <Text type="secondary">Đến:</Text>{" "}
            {dayjs(record.end_date).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: (_, record) => {
        if (record.blocked) return <Tag color="error">ĐÃ KHÓA</Tag>;
        const isExpired = dayjs().isAfter(dayjs(record.end_date));
        return (
          <Tag color={isExpired ? "default" : "blue"}>
            {isExpired ? "Hết hạn" : "Đang hoạt động"}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      width: 120,
      render: (_, record) =>
        (
          <Space>
            {/* NÚT SỬA */}
            <Button
              type="text"
              icon={
                <EditOutlined
                  style={{ color: record.blocked ? "#d9d9d9" : "blue" }}
                />
              }
              disabled={record.blocked}
              onClick={() => {
                handleEdit(record);
              }}
            />

            <Button
              type="text"
              icon={
                record.blocked ? (
                  <LockOutlined style={{ color: "red" }} />
                ) : (
                  <UnlockOutlined style={{ color: "blue" }} />
                )
              }
              onClick={() => handleToggleLock(record)}
            />
          </Space>
        ),
    },
  ];

  const handleSubmit = async (values) => {
    const [startDate, endDate] = values.range;
    const newPromotion = {
      id_partner,
      code: values.code.toUpperCase(),
      for_hotels: values.for_hotels,
      discount_percent: values.discount_percent,
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
    };

    if (editingId) {
      const res = await PromotionApiPartner.updatePromotion(editingId,newPromotion);
      if (res.status >= 400) {
        antdMessage.error(res.message);
        return;
      }

      setLoading(true);
      antdMessage.success(res.message);
      setTimeout(() => {
        setLoading(false);
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
      }, 1000);
    } else {
      const res = await PromotionApiPartner.createPromotion(newPromotion);
      if (res.status >= 400) {
        antdMessage.error(res.message);
        return;
      }

      setLoading(true);
      antdMessage.success(res.message);
      setTimeout(() => {
        setLoading(false);
        setIsModalVisible(false);
        setEditingId(null);
        form.resetFields();
      }, 1000);
    }
  };

  const handleChangeHotel = async (id) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSelectedHotel(id);
    }, 1000);
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <HomeOutlined /> Quản lý mã giảm giá
            </Title>
            <Text type="secondary">
              Tổng hợp tất cả các mã giảm giá đang hoạt động
            </Text>
          </Col>
        </Row>
      </Card>
      <Card variant={false} style={{ borderRadius: 12, marginBottom: 24 }}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo khách sạn"
              value={selectedHotel}
              onChange={(id) => handleChangeHotel(id)}
            >
              {hotels &&
                hotels.map((h) => (
                  <Select.Option key={h._id} value={h._id}>
                    {h.hotel_name}
                  </Select.Option>
                ))}
            </Select>
          </Col>
          <Col span={8}>
            <Input
              placeholder="Tìm mã giảm giá (VD: SUMMER20)..."
              prefix={<SearchOutlined />}
              // value={searchText}
              onChange={e => handleSearch(e)}
              allowClear
            />
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Tạo mã giảm giá mới
            </Button>
          </Col>
        </Row>
        <Table
          loading={loading}
          columns={columns}
          dataSource={promotions.filter(promotion => promotion.code.toLowerCase().includes(textSearch)) || promotions}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total) => `Tổng cộng ${total} mã`,
          }}
        />
      </Card>

      <Modal
        title={editingId ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
        }}
        confirmLoading={loading}
        width={700}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="for_hotels"
            label="Khách sạn áp dụng"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 khách sạn" },
            ]}
          >
            <Select mode="multiple" placeholder="Chọn khách sạn" allowClear>
              {hotels &&
                hotels.map((h) => (
                  <Select.Option key={h._id} value={h._id}>
                    {h.hotel_name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="code"
                label="Mã Code"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="KM2026"
                  style={{ textTransform: "uppercase" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="discount_percent"
                label="Giảm %"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  suffix="%"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="range"
                label="Thời gian hiệu lực"
                rules={[{ required: true }]}
              >
                <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} value={datesPreview}/>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnerDiscounts;
