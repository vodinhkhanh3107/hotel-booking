import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const [cookies] = useCookies(["admin", "partner"]);
  // Lấy role đầu tiên
  const role = allowedRoles?.[0];
  // Chưa đăng nhập
  if (!cookies[role]) {
    const loginUrl =
      role === "admin" ? "/admin/login" : "/partner/login";
    return (
      <Navigate
        to={loginUrl}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;