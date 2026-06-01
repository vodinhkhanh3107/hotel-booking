import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Card, Typography, App as AntApp, Badge, Tooltip, Empty, Tabs, Row, Col, DatePicker, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, CalendarOutlined, DollarOutlined, BankOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { HotelApiPartner, OrderApiPartner } from '../../services/apiPartner.jsx';
import { formatDate } from '../../helpers/date.js';
import { useCookies } from "react-cookie";
import { useOutletContext } from 'react-router-dom';
import dayjs from "dayjs";
import useHandleSearch from "../../hooks/useHandleSearch.jsx";
 
const { Title, Text } = Typography;

const PartnerBookings = () => {
  const { textSearch,handleSearch } = useHandleSearch();
  const { fetchPendingCount } = useOutletContext();

  const [cookies,_] = useCookies();
  const [orders,setOrder] = useState([]);

  const { message: antdMessage } = AntApp.useApp();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số dòng mỗi trang

  const id_partner = cookies.partner.id;
  
  useEffect(() => { 
    const fetchApi = async () => {
        const res = await OrderApiPartner.getAllOrder(id_partner,activeTab);
        if(res.status === 200){
          setLoading(false);
          setOrder(res.orders);
        }
      }
    fetchApi();
  }, [activeTab,loading,id_partner]);

  const handleUpdateStatus = async (id_order, status, id_room) => {
    setLoading(true);
    const res = await HotelApiPartner.operationForClient(id_order,status,id_room);
    if(res.status >= 400){
      message.error(res.message);
      return;
    }

    antdMessage.success(res.message);
    setTimeout(async() => {
      await fetchPendingCount();
      setLoading(false);
    }, 1000);
  };

  const handleFilterDateOrder = async (dates) => {
    const check_in_date = dayjs(dates[0]).format("YYYY-MM-DD");
    const check_out_date = dayjs(dates[1]).format("YYYY-MM-DD");
    try{
      const res = await OrderApiPartner.getAllOrder(id_partner,activeTab,check_in_date,check_out_date);
      if(res.status >= 400){
        message.error(res.message);
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setOrder(res.orders);
        setLoading(false);
      }, 1000);
    }

    catch(error){
      console.error(error);
      message.error("Lỗi hệ thống!")
    }
  }

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Text strong>{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    { 
      title: 'Mã đơn', 
      key: 'code_order',
      width: 80,
      render: (record) => <Text code style={{color: '#1890ff', fontSize: '11px'}}>{`#${record.code_order}`}</Text>
    },
    { 
      title: 'Khách hàng', 
      key: 'user_name',
      width: 140,
      render: (record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{fontSize: '12px'}}><UserOutlined /> {record.full_name || 'Khách'}</Text>
          <Text type="secondary" style={{fontSize: 10}}>{record.email || 'No email'}</Text>
        </Space>
      )
    },
    { 
      title: 'Khách sạn', 
      dataIndex: 'hotel_name',
      key: 'hotel_name',
      width: 130,
      render: (name) => <Text strong style={{fontSize: '11px'}}><BankOutlined /> {name}</Text>
    },
    { 
      title: 'Phòng', 
      key: 'room_info',
      width: 90,
      render: (record) => (
        <Space direction="vertical" size={0}>
          <Tag color="cyan" style={{margin: 0, fontSize: '10px'}}>P.{record.number_room || record.id_room}</Tag>
          {/* <Text type="secondary" style={{fontSize: 10}}>{record.type_room || 'Standard'}</Text> */}
        </Space>
      )
    },
    { 
      title: 'Lưu trú', 
      key: 'dates',
      width: 140,
      render: (record) => (
        <div style={{lineHeight: '1.4', fontSize: 10}}>
          <div><Text type="success">●</Text> {formatDate(record.check_in_date)}</div>
          <div><Text type="danger">●</Text> {formatDate(record.check_out_date)}</div>
        </div>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      align: 'right',
      render: (price) => <Text strong style={{color: '#faad14', fontSize: '12px'}}>{Number(price)?.toLocaleString()}₫</Text>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      align: 'center',
      render: (record) => {
        const s = (record.status).toUpperCase();
        const statusConfig = {
          'PENDING': { color: 'orange', text: 'CHỜ DUYỆT' },
          'APPROVED': { color: 'green', text: 'XÁC NHẬN' },
          'REJECTED': { color: 'red', text: 'TỪ CHỐI' },
          'COMPLETED': { color: 'green', text: 'HOÀN THÀNH' }
        };
        const config = statusConfig[s] || { color: 'default', text: s.toUpperCase() };
        return <Tag color={config.color} style={{borderRadius: 10, fontSize: '9px'}}>{config.text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const s = (record.status).toUpperCase();
        
        if (s === 'PENDING') {
          return (
            <Space size="middle">
              <Tooltip title="Xác nhận">
                <CheckOutlined 
                  style={{ color: 'blue', cursor: 'pointer', fontSize: '16px' }} 
                  onClick={() => handleUpdateStatus(record._id, 'APPROVED',record.id_room)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <CloseOutlined 
                  style={{ color: 'red', cursor: 'pointer', fontSize: '16px' }} 
                  onClick={() => handleUpdateStatus(record._id, 'REJECTED',record.id_room)}
                />
              </Tooltip>
            </Space>
          );
        }
        return (
          <Tooltip title="Xem chi tiết">
            <InfoCircleOutlined 
              style={{ color: '#1890ff', cursor: 'pointer', fontSize: '18px' }} 
              onClick={() => antdMessage.info("Chi tiết đơn hàng đang được cập nhật")}
            />
          </Tooltip>
        );
      }
    }
  ];

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}> 
        <Card bordered={false} style={{ marginBottom: 12, borderRadius: 8 }}>
          <Row justify="space-between" align="middle">
            <Col>
            <Title level={4} style={{ margin: 0 }}>Quản lý Đơn đặt phòng</Title>
            <Text type="secondary" >Xem, lọc và quản lý các đơn đặt phòng của khách hàng</Text>
            </Col>
            <Col>
              <Space>
                <Badge status="processing" text="Dữ liệu thực" />
                <Button size="small" onClick={() => {
                  console.log("hihi")
                  setLoading(true)
                }}>Làm mới</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card  bordered={false} style={{ borderRadius: 12 }}>
          <Tabs activeKey={activeTab} onChange={(key) => {
            setLoading(true);
            setActiveTab(key)
          }} size="small"
            
            items={[
              { label: 'Tất cả', key: '' },
              { label: 'Chờ duyệt', key: 'PENDING' },
              { label: 'Đã xác nhận', key: 'APPROVED' },
              { label: 'Đã từ chối', key: 'REJECTED' },
              { label: 'Hoàn thành', key: 'COMPLETED' },
            ]}
            tabBarExtraContent={
              <Space style={{ paddingBottom: 8 }} wrap>
              <Input 
                placeholder="Mã đơn..." 
                prefix={<SearchOutlined />} 
                onChange={e => { 
                  handleSearch(e);
                 }} 
                allowClear
                style={{ width: 130, borderRadius: 8 }}
              />
              <Input 
                placeholder="Tên khách sạn..." 
                prefix={<BankOutlined />} 
                onChange={e => { 
                  handleSearch(e);
                 }} 
                allowClear
                style={{ width: 180, borderRadius: 8 }}
              />
              <DatePicker.RangePicker 
                placeholder={['Nhận', 'Trả']}
                onChange={(dates) => handleFilterDateOrder(dates)}
                style={{ borderRadius: 8, width: 230 }}
              />
            </Space>
            }
          />

          <Table 
            columns={columns} 
            dataSource={orders.filter(order => order.code_order.toLowerCase().includes(textSearch) || order.hotel_name.toLowerCase().includes(textSearch)) || orders}
            
            rowKey={(record) => record.code_order || record._id}
            loading={loading}
            pagination={{
              pageSize: pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total) => `Tổng cộng ${total} đơn đặt phòng`
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default PartnerBookings;