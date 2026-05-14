import React, { useEffect, useState } from "react";
import { sellerDashboardStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_URL from "../../config";
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineLibrary,
  HiOutlinePencilAlt,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiPlus,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";

const SellerDashboard = () => {
  const { logout, token } = useAuth();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalInquiries: 0,
    totalViews: 0,
  });

  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  //to fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, propsRes, inqRes] = await Promise.all([
          axios.get(`${API_URL}api/property/seller/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}api/property/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}api/inquiry/seller`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setStats(statsRes.data.stats || statsRes.data);
        const props = Array.isArray(propsRes.data)
          ? propsRes.data
          : propsRes.data.properties || [];
        setProperties(props);
        setInquiries(
          Array.isArray(inqRes.data.inquiries)
            ? inqRes.data.inquiries.slice(0, 3)
            : Array.isArray(inqRes.data)
              ? inqRes.data.slice(0, 3)
              : [],
        );
        setLoading(false);
      } catch (error) {
        console.error("Tải dữ liệu thất bại!", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  //to delete a property
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh sách này chứ?")) return;
    try {
      await axios.delete(`${API_URL}api/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p._id !== id));
    } catch (error) {
      alert("Xóa thất bại!");
    }
  };

  //to update status ( make it sold or for sale)
  // const handleStatusUpdate = async (id, currentStatus) => {
  //   const newStatus = currentStatus === "sold" ? "sale" : "sold";

  //   try {
  //     await axios.patch(
  //       `${API_URL}api/property/${id}/status`,
  //       {
  //         status: newStatus,
  //       },

  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );
  //     setProperties(
  //       properties.map((p) => (p._id === id ? { ...p, status: newStatus } : p)),
  //     );
  //   } catch (error) {
  //     alert("Cập nhật sản phẩm thất bại!");
  //   }
  // };
  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === "sold" ? "sale" : "sold";

    try {
      await axios.patch(
        `${API_URL}api/property/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Cập nhật lại danh sách
      setProperties((prevProperties) =>
        prevProperties.map((p) =>
          p._id === id ? { ...p, status: newStatus } : p,
        ),
      );

      // Optional: thông báo thành công
      // alert(newStatus === "sold" ? "Đã chuyển sang trạng thái ĐÃ BÁN" : "Đã chuyển sang trạng thái CÒN BÁN");
    } catch (error) {
      console.error("Update status error:", error);
      alert("Cập nhật trạng thái thất bại! Vui lòng thử lại.");
    }
  };
  //to export the data
  const handleExport = () => {
    const headers = ["Title", "Location", "Type", "Price", "Status", "Views"];
    const csvRows = properties.map((p) => [
      p.title,
      `${p.area}, ${p.city}`,
      p.propertyType,
      p.price,
      p.status,
      p.views || 0,
    ]);

    const csvContent = [headers, ...csvRows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "property_listings.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );

  const statCards = [
    {
      title: "Tổng lượt xem",
      value: stats.totalViews?.toLocaleString() || "0",
      icon: HiOutlineEye,
      color: "#0d6e59",
    },
    {
      title: "Khách hàng tiềm năng",
      value: stats.totalInquiries?.toLocaleString() || "0",
      icon: HiOutlineUserGroup,
      color: "#0d6e59",
    },
    {
      title: "BĐS đang hoạt động",
      value: stats.activeListings?.toLocaleString() || "0",
      icon: HiOutlineLibrary,
      color: "#0d6e59",
    },
    {
      title: "BĐS đã bán",
      value: stats.soldProperties?.toLocaleString() || "0",
      icon: HiOutlineCheckCircle,
      color: "#0d6e59",
    },
  ];

  const filteredProperties = Array.isArray(properties)
    ? properties
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.area.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.headerTitle}>Seller Dashboard</h1>
          <p className={s.headerSubtitle}>
            Quản lý danh mục đầu tư bất động sản và theo dõi hiệu quả kinh
            doanh.
          </p>
        </div>
        <div className={s.headerActions}>
          <button onClick={handleExport} className={s.exportButton}>
            <HiOutlineDownload size={20} />
            Xuất file
          </button>
          <Link to="/add-property" className={s.addButton}>
            <HiPlus size={20} /> Thêm BĐS
          </Link>
        </div>
      </header>

      {/* stats grid */}
      <div className={s.statsGrid}>
        {statCards.map((card, i) => (
          <div
            style={{ "--card-color": card.color }}
            key={i}
            className={s.statCard}
          >
            <div className={s.statIconWrapper}>
              <card.icon size={20} />
            </div>
            <div className={s.statTitle}>{card.title}</div>
            <div className={s.statValue}>{card.value}</div>
          </div>
        ))}
      </div>
      <div className={s.listingsSection}>
        <div className={s.listingsHeader}>
          <h2 className={s.listingsTitle}>Danh sách BĐS</h2>
          <div className={s.searchWrapper}>
            <HiOutlineSearch className={s.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm BĐS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={s.searchInput}
            />
          </div>
        </div>
        {filteredProperties.length === 0 ? (
          <div className={s.emptyListings}>
            Không có BĐS nào khớp với "{searchTerm}".
          </div>
        ) : (
          <>
            <div className={s.propertiesGrid}>
              {filteredProperties.slice(0, 3).map((p) => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  renderActions={() => (
                    <div className={s.propertyActions}>
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(p._id, p.status);
                        }}
                        className={s.statusButton(p.status)}
                        title={
                          p.status === "sold"
                            ? "Đánh dấu là còn bán"
                            : "Đánh dấu đã bán"
                        }
                      >
                        <HiOutlineCheckCircle size={14} />{" "}
                        {p.status === "sold" ? "Có sẵn" : "Đã bán"}
                      </button> */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(p._id, p.status);
                        }}
                        className={s.statusButton(p.status)}
                        title={
                          p.status === "sold"
                            ? "Chuyển về trạng thái đang bán"
                            : "Đánh dấu là đã bán"
                        }
                      >
                        <HiOutlineCheckCircle size={14} />
                        {p.status === "sold" ? "Còn bán" : "Đã bán"}
                      </button>
                      <Link
                        to={`/edit-property/${p._id}`}
                        className={s.editButton}
                      >
                        <HiOutlinePencilAlt size={14} /> Chinh sửa
                      </Link>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className={s.deleteButton}
                      >
                        <HiOutlineTrash size={14} /> Xóa
                      </button>
                    </div>
                  )}
                />
              ))}
            </div>

            {filteredProperties.length > 3 && (
              <div className={s.showMoreWrapper}>
                <Link to="/my-properties" className={s.showMoreButton}>
                  Hiển thị thêm{" "}
                  <HiOutlinePencilAlt
                    size={18}
                    style={{
                      transform: "rotate(90deg)",
                    }}
                  />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      <div className={s.widgetsGrid}>
        <div className={s.inquiriesWidget}>
          <h2 className={s.widgetTitle}>Yêu cầu tư vấn gần đây</h2>
          <p className={s.widgetSubtitle}>Khách hàng tiềm năng mới liên hệ</p>
          <div className={s.inquiriesList}>
            {inquiries.map((inq, i) => (
              <div key={inq._id} className={s.inquiryItem}>
                <div className={s.inquiryLeft}>
                  <div className={s.inquiryIcon}>
                    <HiOutlineBell size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div className={s.inquiryName}>
                      {inq.buyer?.name || "Khách hàng tiềm năng"}
                    </div>
                    <div className={s.inquiryProperty}>
                      {inq.property?.title?.length > 30
                        ? inq.property?.title?.slice(0, 30) + "..."
                        : inq.property?.title}
                    </div>
                  </div>
                </div>
                <div className={s.inquiryRight}>
                  <div className={s.inquiryDate}>
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </div>
                  <span className={s.inquiryStatus(inq.status)}>
                    {inq.status === "read" ? "Đã đọc" : "Mới"}
                  </span>
                </div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className={s.noInquiries}>Không có yêu cầu gần đây</p>
            )}
          </div>
        </div>
        <div className={s.tipsWidget}>
          <h2 className={s.widgetTitle}>Gợi ý nhanh</h2>
          <div className={s.tipsList}>
            <div className={s.tipCardHighViews}>
              <h4 className={s.tipTitleHighViews}>
                <HiOutlineEye size={16} /> Được xem nhiều!
              </h4>
              <p className={s.tipTextHighViews}>
                BĐS của bạn đang được quan tâm . Hãy cập nhật thêm video/hình
                ảnh!!
              </p>
            </div>
            <div className={s.tipCardMarket}>
              <h4 className={s.tipTitleMarket}>Phân tích thị trường</h4>
              <p className={s.tipTextMarket}>
                Thị trường khu vực đang tăng trưởng nhanh. Mức giá của bạn hiện
                rất cạnh tranh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;
