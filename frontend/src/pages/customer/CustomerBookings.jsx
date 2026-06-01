import React, { useState, useEffect } from 'react';
import { 
  Table, Tag, Card, Typography, Button, Space, 
  App as AntApp, Spin, Empty, Tabs, Tooltip, 
  Modal, Rate, Input, Badge, Descriptions 
} from 'antd';
import { 
  HistoryOutlined, StarOutlined, StarFilled,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CalendarOutlined, MessageOutlined,
  EyeOutlined
} from '@ant-design/icons';

// Import dữ liệu mẫu
import { OrderApiClient, ReviewApiClient } from '../../services/apiClient.jsx';
import { useCookies } from 'react-cookie';
import { formatDate } from '../../helpers/date.js';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CustomerBookings = () => {
  const navigate = useNavigate();
  const [cookies,_] = useCookies();
  const [orders,setOrder] = useState([]);

  const { message: antdMessage } = AntApp.useApp();
  const [loading, setLoading] = useState();
  const [activeTab, setActiveTab] = useState('');

  // --- STATE CHO MODAL ĐÁNH GIÁ (GỬI MỚI) ---
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewingRecord, setReviewingRecord] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // --- STATE CHO MODAL XEM CHI TIẾT (ĐÃ ĐÁNH GIÁ) ---
  const [isReviewDetailOpen, setIsReviewDetailOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const fetchApi = async () => {
      const id_user = cookies.user.id;
      if(id_user){
        const res = await OrderApiClient.getMyOrder(id_user,activeTab);
        if(res.status === 200){
          setTimeout(() => {
            setOrder(res.orders);
          }, 1000); 
        }
      };
    };

    fetchApi();
  }, [cookies.user.id,activeTab,loading]);

  // Hàm mở Modal gửi đánh giá mới
  const openReviewModal = (record) => {
    setReviewingRecord(record);
    setRating(5);
    setReviewComment('');
    setIsReviewModalVisible(true);
  };

  // HÀM MỚI: Mở Modal xem chi tiết đánh giá cũ
  const openReviewDetail = (record) => {
    setSelectedReview(record);
    setIsReviewDetailOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingRecord){
      antdMessage.error("Không tim thấy thông tin khách sạn này trong hệ thống!");
      return;
    };

    if(!reviewComment){
      antdMessage.error("Hãy viết gì đó cho phần đánh giá!");
      return;
    }

    const newReview = {
      id_order: reviewingRecord._id,
      id_user: reviewingRecord.id_user, 
      id_hotel: reviewingRecord.id_hotel,
      id_room: reviewingRecord.id_room,
      rating,
      comment: reviewComment,
    };
    const res = await ReviewApiClient.createReview(newReview);
    if(res.status >= 400){
      antdMessage.error(res.message);
      return;
    }
    antdMessage.success(res.message);
    setLoading(true);
    setIsReviewModalVisible(false);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleActiveTab = (key) => {
    setLoading(true);
    setActiveTab(key);
    setTimeout(() => {
      setLoading(false);
      
    }, 1000);
  }

  const handleCancelBooking = async (id) => {
    try{
      const res = await OrderApiClient.cancelOrder(id);
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
      console.error(error);
      antdMessage.error("Lỗi hệ thống!");
    }
  }

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code_order',
      key: 'code_order',
      width: 100,
      render: (code_order) => <Text code>{code_order}</Text>
    },
    {
      title: 'Khách sạn',
      // dataIndex: 'hotel_name',
      key: 'hotel_name',
      width: 200,
      ellipsis: true,
      render: (hotel) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1890ff' }}>{hotel.hotel_name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{hotel.hotel_address || 'Địa chỉ đang cập nhật'}</Text>
        </Space>
      )
    },
    { 
      title: 'Ngày nhận', 
      dataIndex: 'check_in_date',
      key: 'check_in_date',
      width: 120,
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text style={{fontSize: '12px'}}><CalendarOutlined style={{color: '#52c41a'}}/> {formatDate(date)}</Text>
          <Text type="secondary" style={{fontSize: '10px'}}>Check-in</Text>
        </Space>
      )
    },
    { 
      title: 'Ngày trả', 
      dataIndex: 'check_out_date',
      key: 'check_out_date',
      width: 120,
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text style={{fontSize: '12px'}}><CalendarOutlined style={{color: '#ff4d4f'}} /> {formatDate(date)}</Text>
          <Text type="secondary" style={{fontSize: '10px'}}>Check-out</Text>
        </Space>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 130,
      align: 'right',
      render: (total_amount) => (
        <Text strong style={{ color: '#e11d48', fontSize: 14 }}>
          {Number(total_amount).toLocaleString()}₫
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status) => {
        const s = status.toUpperCase();
        const configs = {
          'PENDING': { color: 'orange', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
          'APPROVED': { color: 'green', text: 'Đã duyệt', icon: <CheckCircleOutlined /> },
          'COMPLETED': { color: 'green', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
          'CANCELLED': { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
          'REJECTED': { color: 'red', text: 'Từ chối', icon: <CloseCircleOutlined /> }
        };
        const config = configs[s];
        return (
          <Tag icon={config.icon} color={config.color} style={{ borderRadius: 12, padding: '0 10px' }}>
            {config.text.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Hủy đơn',
      key: 'cancel',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const s = record.status;
        // SỬA Ở ĐÂY: Chỉ cần là Pending/Chờ duyệt là cho hủy, bỏ điều kiện ngày giờ đi
        const canCancel = s === 'PENDING';
        
        return canCancel ? (
          <Button danger size="small" onClick={() => handleCancelBooking(record._id)}>Hủy</Button>
        ) : <Text type="secondary">—</Text>;
      }
    },
    {
      title: 'Đánh giá',
      key: 'review',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const s = (record.status).toUpperCase();
        const canNotReview = s !== 'APPROVED' && s !== 'COMPLETED';
        
        if (canNotReview) return <Text type="secondary">—</Text>;
        
        if (record.rating) {
          const ratingCount = record.rating || 5;
          return (
            <Space direction="vertical" size={2} align="center">
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: ratingCount }).map((_, index) => (
                  <StarFilled key={index} style={{ color: '#faad14', fontSize: '12px' }} />
                ))}
              </div>
              <Typography.Link 
                style={{ fontSize: '12px' }} 
                onClick={() => openReviewDetail(record)} 
              >
                Chi tiết
              </Typography.Link>
            </Space>
          );
        }
        
        return (
          <Button 
            type="primary" size="small" ghost 
            icon={<StarOutlined />}
            onClick={() => openReviewModal(record)}
            style={{ fontSize: '11px', borderRadius: '4px' }}
          >
            Đánh giá
          </Button>
        );
      }
    },
    {
      title: 'Chi tiết',
      key: 'details',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết đơn">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            style={{ color: '#1890ff' }}
            // Chú ý: Gửi nguyên cục 'record' sang làm 'bookingData' để trang detail hiển thị
            onClick={() => navigate('/checkout/success', { state: { code_order:  record.code_order} })}
          >
            Xem
          </Button>
        </Tooltip>
      )
    }
  ];

  return (
    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          <HistoryOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          Lịch sử đặt phòng
        </Title>
        <Badge count={orders.length} color="#1890ff" showZero>
          <Button type="text">Tất cả đơn hàng</Button>
        </Badge>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={handleActiveTab}
        items={[
          { label: 'Tất cả đơn', key: '' },
          { label: 'Đang chờ', key: 'PENDING' },
          { label: 'Đã duyệt', key: 'APPROVED' },
          { label: 'Đã hủy', key: 'CANCELLED' },
          { label: 'Hoàn thành', key: 'COMPLETED' },

        ]}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
      ) : (
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 6, placement: 'bottomCenter' }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: <Empty description="Không tìm thấy đơn hàng nào." /> }}
        />
      )}

      {/* MODAL GỬI ĐÁNH GIÁ MỚI */}
      <Modal
        title={<Space><MessageOutlined style={{color: '#faad14'}} /> Đánh giá trải nghiệm</Space>}
        open={isReviewModalVisible}
        onOk={handleSubmitReview}
        onCancel={() => setIsReviewModalVisible(false)}
        okText="Gửi đánh giá"
        cancelText="Để sau"
        centered
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <Text strong style={{ fontSize: 16 }}>{reviewingRecord?.hotel_name}</Text>
          <div style={{ margin: '15px 0' }}>
            <Rate value={rating} onChange={setRating} style={{ fontSize: 35 }} />
          </div>
          <Input.TextArea
            rows={4}
            placeholder="Chia sẻ cảm nhận của bạn..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </div>
      </Modal>

      {/* MODAL XEM CHI TIẾT ĐÁNH GIÁ */}
      <Modal
        title={<Space><StarFilled style={{ color: '#faad14' }} /> Chi tiết đánh giá từ bạn</Space>}
        open={isReviewDetailOpen}
        onCancel={() => setIsReviewDetailOpen(false)}
        footer={[<Button key="close" onClick={() => setIsReviewDetailOpen(false)}>Đóng</Button>]}
        width={650}
        centered
      >
        {selectedReview ? (
          <Descriptions 
            bordered 
            column={1} 
            size="small"
            labelStyle={{ width: '30%', fontWeight: 'bold', backgroundColor: '#fafafa' }}
            contentStyle={{ width: '70%', backgroundColor: '#fff' }}
          >
            <Descriptions.Item label="Mã đơn hàng">
              <Text code>{selectedReview.code_order}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Khách sạn">
              {selectedReview.hotel_name}
            </Descriptions.Item>
            <Descriptions.Item label="Điểm đánh giá">
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: selectedReview.rating || 5 }).map((_, i) => (
                  <StarFilled key={i} style={{ color: '#faad14' }} />
                ))}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Bình luận của bạn">
              <div style={{ minHeight: '80px', whiteSpace: 'pre-line', padding: '8px 0' }}>
                {selectedReview.comment || "Bạn không để lại bình luận."}
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : <Empty />}
      </Modal>
    </Card>
  );
};

export default CustomerBookings;