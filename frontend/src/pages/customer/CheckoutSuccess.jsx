import React, { useEffect, useMemo, useState } from "react";
import {
  Result,
  Button,
  Card,
  Typography,
  Descriptions,
  Space,
  Divider,
  Tag,
  Select,
} from "antd";
import {
  CheckCircleFilled,
  HistoryOutlined,
  HomeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { OrderApiClient } from "../../services/apiClient";
import dayjs from "dayjs"

const { Title, Text } = Typography;

const CheckoutSucess = () => {
  const [orderDetail,setOrderDetail] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const code_order = location.state?.code_order;
    // console.log(code_order);
    // console.log(location);
    if(!code_order){
      // console.log("lỗi")
      navigate("/404");
      return;
    }
    const fetchOrderDetail = async () => {
      const res = await OrderApiClient.getDetailOrder(code_order.slice(1));
      console.log(res);
      if(res.status === 200){
        setOrderDetail(res.orderDetail);
      }
    }

    fetchOrderDetail();
  }, [location.state?.code_order,navigate]);

  return (
    <div style={{ maxWidth: 850, margin: '40px auto', padding: '0 20px' }}>
      <Card
        bordered={false}
        style={{ borderRadius: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      >
        <Result
          status="success"
          title={<Title level={2} style={{ color: '#10b981', marginBottom: 0 }}>Đặt phòng thành công!</Title>}
          subTitle={
            <Space direction="vertical" size={4} style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>Hệ thống đã ghi nhận đơn đặt phòng của bạn.</Text>
              <Text strong style={{ fontSize: 18 }}>
                Mã đơn: <Text code style={{ fontSize: 18, color: '#1890ff' }}>{orderDetail.code_order}</Text>
              </Text>
            </Space>
          }
          icon={<CheckCircleFilled style={{ color: '#10b981' }} />}
          extra={[
            <Button
              type="primary"
              key="history"
              icon={<HistoryOutlined />}
              size="large"
              onClick={() => navigate('/customerbookings')}
              style={{ background: '#1890ff', borderRadius: 10, height: 48, fontWeight: 600 }}
            >
              Xem lịch sử đặt phòng
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined />}
              size="large"
              onClick={() => navigate('/')}
              style={{ borderRadius: 10, height: 48 }}
            >
              Quay lại trang chủ
            </Button>,
          ]}
        >
          {/* BOX CHI TIẾT ĐƠN HÀNG */}
          <div style={{
            textAlign: 'left',
            background: '#fcfcfc',
            padding: '30px',
            borderRadius: 20,
            border: '1px solid #f0f0f0'
          }}>
            <Title level={4} style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FileTextOutlined style={{ marginRight: 10, color: '#3b82f6' }} />
              Chi tiết đơn đặt phòng
            </Title>

            <Descriptions column={{ xs: 1, sm: 2 }} bordered={false} size="middle">
              <Descriptions.Item label={<Space><EnvironmentOutlined /> Khách sạn</Space>}>
                <Text strong>{orderDetail.hotel_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số phòng">
                <Tag color="cyan" style={{ fontSize: 14, fontWeight: 600 }}>Phòng {orderDetail.number_room}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Space><CalendarOutlined /> Ngày nhận</Space>}>
                <Text strong>{dayjs(orderDetail.check_in_date).format('DD/MM/YYYY')}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Space><CalendarOutlined /> Ngày trả</Space>}>
                <Text strong>{dayjs(orderDetail.check_out_date).format('DD/MM/YYYY')}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người đặt">
                <Text>{orderDetail.user}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="orange">ĐANG CHỜ DUYỆT</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '24px 0' }} />

            <Title level={5} style={{ marginBottom: 16 }}>Chi tiết thanh toán</Title>

            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Giá gốc ({orderDetail.nights || 1} đêm)</Text>
                <Text>{Number(orderDetail.sub_total).toLocaleString()}₫</Text>
              </div>
              {orderDetail?.promotion && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">
                    Mã giảm giá <Tag color="green" style={{ marginLeft: 8 }}>{orderDetail?.promotion?.code}</Tag>
                  </Text>
                  <Text type="success">- {Number(orderDetail?.promotion?.discount_percent).toLocaleString()}%</Text>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Phí dịch vụ & Thuế</Text>
                <Text>{Number(orderDetail.tax || 0).toLocaleString()}₫</Text>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              {/* Tổng cộng cuối cùng */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 18 }}>Tổng thanh toán</Text>
                <Text strong style={{ fontSize: 28, color: '#e11d48' }}>
                  {Number(orderDetail.total_amount || 0).toLocaleString()}₫
                </Text>
              </div>
            </Space>

            <div style={{ marginTop: 24, padding: '12px', background: '#e6f7ff', borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <InfoCircleOutlined /> Bạn có thể quản lý hoặc yêu cầu hủy đơn phòng này trong mục
                <strong> Lịch sử đặt phòng</strong> trước ngày nhận phòng ít nhất 24h.
              </Text>
            </div>
          </div>
        </Result>
      </Card>
    </div>
  );
};

export default CheckoutSucess;
