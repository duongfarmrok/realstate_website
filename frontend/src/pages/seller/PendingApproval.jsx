import React, { useEffect, useState } from "react";
import { pendingApprovalStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineSupport,
} from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

const PendingApproval = () => {
  const { logout, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  //auto redirect khi approved hoặc auto refresh every 10s
  useEffect(() => {
    // Nếu user đã được duyệt, redirect tới dashboard
    if (user?.isApproved) {
      navigate("/seller-dashboard", { replace: true });
      return;
    }

    const interval = setInterval(() => {
      refreshUser();
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.isApproved, refreshUser, navigate]);

  //handle manual refresh
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className={s.container}>
      <div className={s.iconCircle}>
        <HiOutlineClock size={48} />
      </div>
      <h1 className={s.heading}>Đang chờ phê duyệt</h1>
      <p className={s.description}>
        Xin chào {user?.name}, tài khoản người bán của bạn hiện đang được đội
        ngũ quản trị của chúng tôi xem xét. Quá trình phê duyệt thường mất chưa
        đầy 24 giờ. Bạn sẽ có quyền truy cập đầy đủ vào bảng điều khiển sau khi
        được xác minh.
      </p>
      <div className={s.buttonGroup}>
        <a href="/properties" className={s.browseButton}>
          Tìm kiếm BĐS
        </a>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className={`${s.refreshButtonBase} ${
            refreshing ? s.refreshButtonDisabled : s.refreshButtonEnabled
          }`}
        >
          <HiOutlineRefresh
            size={20}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Đang kiểm tra..." : "Kiểm tra trạng thái ngay"}
        </button>
      </div>
      <div className={s.supportContainer}>
        <HiOutlineSupport size={18} />
        Cần hỗ trợ ?{" "}
        <Link to="/contact" className={s.supportLink}>
          Liên hệ hỗ trợ!
        </Link>
      </div>
    </div>
  );
};
export default PendingApproval;
