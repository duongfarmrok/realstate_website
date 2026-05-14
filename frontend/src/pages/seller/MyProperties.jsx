import React, { useEffect, useState } from "react";
import { myPropertiesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";
import {
  HiOutlineCheckCircle,
  HiOutlineLibrary,
  HiOutlinePencilAlt,
  HiOutlineTrash,
} from "react-icons/hi";
import PropertyCard from "../../components/common/PropertyCard";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  //Lấy dữ liệu các bất động sản từ phía máy chủ dành riêng cho người bán này
  const fetchMyProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}api/property/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const props = Array.isArray(res.data)
        ? res.data
        : res.data.properties || [];
      setProperties(props);
      setLoading(false);
    } catch (error) {
      setError("Tải danh sách thất bại!", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  //to delete a property
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa BĐS này không?")) return;
    try {
      await axios.delete(`${API_URL}api/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p._id !== id));
    } catch (error) {
      alert("Xóa BĐS thất bại!");
    }
  };

  //to update the status

  //   const updateStatus = async (id, newStatus) => {
  //     try {
  //       await axios.patch(
  //         `${API_URL}api/property/${id}/status`,
  //         {
  //           status: newStatus,
  //         },
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         },
  //       );
  //       setProperties(
  //         properties.map((p) => (p._id === id ? { ...p, status: newStatus } : p)),
  //       );
  //     } catch (error) {
  //       alert("Cập nhật trạng thái thất bại!");
  //     }
  //   };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}api/property/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p)),
      );

      alert(
        newStatus === "sold"
          ? " Đã chuyển sang ĐÃ BÁN"
          : " Đã chuyển sang CÒN BÁN",
      );
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };
  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  const getAvailableStatus = (p) => {
    return "sale";
  };
  return (
    <div className={s.fadeIn}>
      <div className={s.fadeIn}>
        <div className={s.header}>
          <div>
            <h1 className={s.heading}>Danh sách của tôi.</h1>
            <p className={s.subheading}>
              Quản lý danh sách BĐS và trạng thái của chúng!
            </p>
          </div>

          <Link to="/add-property" className={s.addButton}>
            Đăng BĐS mới
          </Link>
        </div>
        <div className={s.content}>
          {!Array.isArray(properties) || properties.length === 0 ? (
            <div className={s.emptyCard}>
              <div className={s.emptyIconWrapper}>
                <HiOutlineLibrary size={40} color="#94a3b8" />
              </div>
              <h2 className={s.emptyTitle}>Không tìm thấy BĐS</h2>
              <p className={s.emT}>
                Khởi đầu trải nghiệm bằng việc thêm bài đăng bất động sản đầu
                tiên của bạn
              </p>
              <Link to="/add-property" className={s.emptyButton}>
                Thêm BĐS đầu tiên của bạn
              </Link>
            </div>
          ) : (
            <div className={s.grid}>
              {properties.map((p) => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  renderActions={() => (
                    <div className={s.actionContainer}>
                      <div className={s.selectWrapper}>
                        <select
                          value={p.status || "sale"}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            updateStatus(p._id, newStatus);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className={`${s.select} ${
                            p.status === "sold"
                              ? s.selectSold
                              : s.selectAvailable
                          }`}
                        >
                          <option value="sale">Còn bán</option>
                          <option value="sold">Đã bán</option>
                        </select>
                      </div>

                      <Link
                        to={`/edit-property/${p._id}`}
                        className={s.editButton}
                      >
                        <HiOutlinePencilAlt /> Chỉnh sửa
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p._id);
                        }}
                        className={s.deleteButton}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProperties;
