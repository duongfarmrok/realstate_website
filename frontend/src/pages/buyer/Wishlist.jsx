import React, { useEffect, useState } from "react";
import { wishlistStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import axios from "axios";
import API_URL from "../../config";
import { HiHeart, HiTrash } from "react-icons/hi";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";

const Wishlist = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guard: Nếu user không login, redirect về home
  useEffect(() => {
    if (!token || !user) {
      navigate("/");
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (token && user) {
      fetchWishlist();
    }
  }, [token, user]); 

  // Refetch khi tab focus lại (người dùng quay lại từ property-detail)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && token) {
        fetchWishlist();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [token]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend trả { success: true, data: [...] }
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setWishlistItems(data);
      setLoading(false);
    } catch (error) {
      setError("Tải danh sách yêu thích thất bại!");
      setWishlistItems([]);
      setLoading(false);
    }
  };

  //to remove property from wishlist
  const removeFromWishlist = async (propertyId) => {
    if (!propertyId) {
      alert("Sản phẩm không tồn tại!");
      return;
    }

    try {
      await axios.delete(`${API_URL}api/wishlist/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlistItems((prev) =>
        prev.filter(
          (item) => item.property && item.property._id !== propertyId,
        ),
      );
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Xóa thất bại!";
      alert(errorMsg);
    }
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>
        <div className={s.headingWrapper}>
          <h1 className={s.heading}>Danh sách yêu thích của bạn</h1>
          <p className={s.subheading}>Sản phẩm bạn đã thêm vào yêu thích.</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className={s.emptyCard}>
            <div className={s.emptyIconWrapper}>
              <HiHeart size={40} />
            </div>

            <h2 className={s.emptyTitle}>Danh sách trống</h2>
            <p className={s.emptyText}>
              Tìm kiếm thêm ngôi nhà mà bạn yêu thích
            </p>

            <Link to="/" className={s.browseButton}>
              Tìm kiếm
            </Link>
          </div>
        ) : (
          <div className={s.gridContainer}>
            {wishlistItems
              .filter((item) => item.property)
              .map((item) => (
                <PropertyCard
                  key={item._id}
                  property={item.property}
                  renderActions={() => (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(item.property._id);
                      }}
                      className={s.removeButton}
                    >
                      <HiTrash size={18} /> Xóa khỏi danh sách
                    </button>
                  )}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
