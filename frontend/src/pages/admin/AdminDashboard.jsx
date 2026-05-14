import React, { useEffect, useState } from "react";
import { adminDashboardStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_URL from "../../config";
import {
  HiOutlineCheckCircle,
  HiOutlineLibrary,
  HiOutlineTicket,
  HiOutlineUserGroup,
} from "react-icons/hi";

// Ví dụ dữ liệu thực tế nhận được từ API
// const [services, setServices] = useState([
//     { name: "Database", status: "online" },
//     { name: "Media Storage", status: "offline" },
//     { name: "Auth Service", status: "online" },
//     { name: "API Gateway", status: "online" }
// ]);

// // Trong phần return:
// {services.map((service, i) => (
//     <div key={i} className={s.serviceItem}>
//         <div className={s.serviceName}>{service.name}</div>
//         <div className={s.statusContainer}>
//             {/* Truyền status vào style để đổi màu dấu chấm */}
//             <span className={s.statusDot(service.status)}></span>

//             {/* Hiển thị chữ tương ứng với status */}
//             <span className={s.statusText}>{service.status}</span>
//         </div>
//     </div>
// ))}
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  //to fetch dashboard data
  useEffect(() => {
    console.log("Dashboard quản trị đã được tải!");
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${API_URL}api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setStats(res.data.stats);
        }
        setLoading(false);
      } catch (error) {
        console.error("Tải thất bại!", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Số lượng người dùng",
      value: stats.totalUsers || 0,
      icon: HiOutlineUserGroup,
      color: "#0d9488",
      bg: "#ccfbf1",
    },
    {
      title: "Tổng BĐS",
      value: stats.totalProperties || 0,
      icon: HiOutlineLibrary,
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    {
      title: "Danh sách có sẵn",
      value: stats.activeListings || 0,
      icon: HiOutlineTicket,
      color: "#3b82f6",
      bg: "#dbeafe",
    },
    {
      title: "Số lượng đã bán",
      value: stats.soldProperties || 0,
      icon: HiOutlineCheckCircle,
      color: "#10b981",
      bg: "#dcfce7",
    },
  ];

  return (
    <>
      <div className={s.headerContainer}>
        <div>
          <h1 className={s.pageTitle}>Tổng quan quản trị</h1>
          <p className={s.pageSubtitle}>
            Chào mừng quay trở lại, Quản trị viên Đây là tổng quan hôm nay.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            window.location.reload();
          }}
          className={s.refreshButton}
        >
          Cập nhật lại
        </button>
      </div>

      <div className={s.statsGrid}>
        {statCards.map((card, i) => (
          <div key={i} className={s.statCard}>
            <div
              className={s.statIconContainer}
              style={{
                backgroundColor: card.bg,
                color: card.color,
              }}
            >
              <card.icon size={22} />
            </div>
            <div>
              <div className={s.statTitle}>{card.title}</div>
              <div className={s.statValue}>{card.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.secondGrid}>
        <div className={s.systemHealthCard}>
          <h3 className={s.systemHealthTitle}>Trạng thái hệ thống</h3>
          <div className={s.servicesContainer}>
            {["Database", "Media Storage", "Auth Service", "API Gateway"].map(
              (service, i) => (
                <div key={i} className={s.serviceItem}>
                  <div className={s.serviceName}>{service}</div>
                  <div className={s.statusContainer}>
                    <span className={s.statusDot}></span>
                    <span className={s.statusText}>Online</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
        <div className={s.adminToolsCard}>
          <h3 className={s.adminToolsTitle}>Công cụ</h3>
          <p className={s.adminToolsDesc}>
            Quản lý nhanh các tài nguyên và nhiệm vụ trên nền tảng.
          </p>
          <div className={s.adminToolsButtonsContainer}>
            <button className={s.adminToolButton}>Nhật ký hệ thống</button>
            <button className={s.adminToolButton}>Sao lưu cơ sở dữ liệu</button>
            <button className={s.adminToolButton}>Cài đặt</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
