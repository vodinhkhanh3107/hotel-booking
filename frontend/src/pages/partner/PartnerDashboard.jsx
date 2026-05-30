import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin, Space, Select, message } from 'antd';
import { Column } from '@ant-design/plots';
import { 
  LineChartOutlined, 
  BarChartOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import { HotelApiPartner, RevenueReportApiPartner } from '../../services/apiPartner';

const { Title, Text } = Typography;
const { Option } = Select;

import { useCookies } from "react-cookie";

const PartnerDashboard = () => {
  const [cookies,setCookie] = useCookies();

  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [processedData, setProcessedData] = useState({
    stats: { totalRevenue: 0 },
    monthly: [],
    chartData: []
  }); 

  console.log(selectedHotel)
  const id_partner = cookies.partner.id;
  useEffect(() => {
    const fetchApiHotel = async() => {
      const res = await HotelApiPartner.getAllHotel(id_partner,"APPROVED");
      if(res.status === 200){
        console.log(res);
        setHotels(res.hotels);
        setSelectedHotel(res.hotels[0]._id);
        setLoading(false);
      }
    }
    
    
    fetchApiHotel();
  }, [id_partner]);

  useEffect(() => {
    const fetchApiRevenue = async () => {
      const res = await RevenueReportApiPartner.getRevenueByHotel(selectedHotel);
      if(res.status === 200){
        console.log(res.revenueByHotel);
        
        const totalRevenue = res.revenueByHotel.reduce((total,revenue) => Number(revenue.total_amount) + total,0);
        const monthly = res.revenueByHotel.map((month,index) => ({
          key: month._id,
          period: month._id,
          revenue: month.total_amount,
          growth: res.revenueByHotel.length > 0 ? ((res.revenueByHotel[index] - res.revenueByHotel[index + 1]) / res.revenueByHotel[index + 1] * 100) : ""
        }));
        const chartData = res.revenueByHotel.map((month) => ({
          month: month._id,
          revenue: month.total_amount
        }))

        setProcessedData({
          chartData,
          monthly,
          stats: {
            totalRevenue
          }
        })
        setLoading(false);
      }
    }
    selectedHotel && fetchApiRevenue();

  }, [selectedHotel]);

  const config = {
    data: processedData.chartData,
    xField: 'month',
    yField: 'revenue',
    label: { 
      position: 'top', 
      style: { fill: '#aaa', opacity: 0.6 }, 
      formatter: (v) => `${(v.revenue / 1000000).toFixed(0)}M` 
    },
    columnStyle: { radius: [4, 4, 0, 0] },
    color: '#1890ff',
  };

  console.log(processedData);
  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
  
  const columns = [
    { title: 'Tháng', dataIndex: 'period', key: 'period', render: (t) => <Text strong>{t}</Text> },
    { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    { title: 'Tăng trưởng', dataIndex: 'growth', key: 'growth', align: 'center', 
      render: (g) => g ? <Tag color={g >= 0 ? 'green' : 'red'}>{g >= 0 ? '+' : ''}{g}%</Tag> : ""
    },
  ];

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Space orientation="vertical" size={0}>
            <Title level={2} style={{ margin: 0 }}>Báo cáo doanh thu</Title>
            <Text type="secondary">Phân tích chi tiết theo từng tháng kinh doanh</Text>
          </Space>
          <Select style={{ width: 280 }} value={selectedHotel} onChange={(id) => setSelectedHotel(id)}>
            {hotels && hotels.map(h => <Option key={h._id} value={h._id}>{h.hotel_name}</Option>)}
          </Select>
        </div>

        <Spin spinning={loading}>
          <Row gutter={[24, 24]}>
            {/* Thẻ Tổng Doanh Thu */}
            <Col span={24}>
              <Card variant={false} style={{ borderRadius: 12, background: '#001529' }}>
                <Statistic 
                  title={<span style={{color: 'rgba(255,255,255,0.7)'}}>Tổng doanh thu lũy kế</span>} 
                  value={processedData.stats.totalRevenue} 
                  formatter={formatCurrency} 
                  valueStyle={{color: '#fff', fontSize: 32}} 
                  prefix={<DollarCircleOutlined />}
                />
              </Card>
            </Col>

            {/* Biểu đồ xu hướng */}
            <Col span={24}>
              <Card title={<Space><BarChartOutlined />Biểu đồ xu hướng 12 tháng gần nhất</Space>} variant={false} style={{ borderRadius: 12 }}>
                <div style={{ height: 350 }}><Column {...config} /></div>
              </Card>
            </Col>

            {/* Bảng chi tiết tháng */}
            <Col span={24}>
              <Card title={<Space><LineChartOutlined />Chi tiết doanh thu theo tháng</Space>} variant={false} style={{ borderRadius: 12 }}>
                <Table 
                  columns={columns} 
                  dataSource={processedData.monthly} 
                  pagination={{ pageSize: 12 }}
                  bordered
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </div>
  );
};

export default PartnerDashboard;