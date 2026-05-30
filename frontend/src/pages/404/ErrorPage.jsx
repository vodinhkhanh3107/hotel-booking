import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "100px 20px", textAlign: "center" }}>
      <Result
        status="404"
        title="Không tìm thấy chi tiết đơn hàng"
        subTitle="Vui lòng kiểm tra lại trong lịch sử đặt phòng của bạn."
        extra={
          <Button type="primary" size="large" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
}
