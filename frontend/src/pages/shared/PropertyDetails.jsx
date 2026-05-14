import React, { useEffect, useState } from "react";
import { propertyDetailsStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_URL from "../../config";
import {
  HiBadgeCheck,
  HiCalendar,
  HiChatAlt,
  HiChevronLeft,
  HiChevronRight,
  HiCollection,
  HiHeart,
  HiLocationMarker,
  HiOutlineHeart,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineViewGrid,
  HiX,
} from "react-icons/hi";
import PropertyCard from "../../components/common/PropertyCard";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [inquiryStatus, setInquiryStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  const [isInWishlist, setIsInWishlist] = useState(false);

  // useEffect(() => {
  //   const fetchDetails = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios.get(`${API_URL}api/property/${id}`, {
  //         headers: token ? { Authorization: `Bearer ${token}` } : {},
  //       });
  //       setProperty(res.data.property);
  //       setSimilarProperties(res.data.similarProperties || []);

  //       if (user && user.role === "buyer") {
  //         const wishRes = await axios.get(`${API_URL}api/wishlist`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         });
  //         const found = wishRes.data.some((item) => item.property?._id === id);
  //         setIsInWishlist(found);
  //       }
  //       setLoading(false);
  //     } catch (error) {
  //       setError("Tải thông tin bất động sản thất bại!");
  //       setLoading(false);
  //     }
  //   };
  //   fetchDetails();
  // }, [id, user, token]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Property Details
        const res = await axios.get(`${API_URL}api/property/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setProperty(res.data.property || res.data);
        setSimilarProperties(res.data.similarProperties || []);

        // Fetch Wishlist - Tách riêng và xử lý an toàn
        if (user && user.role === "buyer" && token) {
          try {
            const wishRes = await axios.get(`${API_URL}api/wishlist`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const wishlistData =
              wishRes.data?.data ||
              wishRes.data?.wishlist ||
              wishRes.data ||
              [];

            const found = wishlistData.some(
              (item) => item?.property?._id === id,
            );
            setIsInWishlist(found);
          } catch (wishErr) {
            console.error("Failed to fetch wishlist:", wishErr);
            setIsInWishlist(false); // Không làm crash trang
          }
        }
      } catch (error) {
        console.error("Property Details Error:", error.response?.data || error);
        setError("Tải thông tin bất động sản thất bại!");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id, user, token]);

  //to handle wishlist toggle

  const handleWishlistToggle = async () => {
    if (!user) return navigate("/login");
    try {
      if (!isInWishlist) {
        await axios.delete(`${API_URL}api/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsInWishlist(false);
      } else {
        await axios.post(
          `${API_URL}api/wishlist/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setIsInWishlist(true);
      }
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  //to handle inquiry form submission
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (user.role !== "buyer")
      return alert("Chỉ người mua mới có thể gửi yêu cầu!");
    setInquiryStatus({ ...inquiryStatus, loading: true });
    try {
      await axios.post(
        `${API_URL}api/inquiries`,
        {
          propertyID: id,
          message: inquiry.message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInquiryStatus({ loading: false, success: true, error: null });
      setInquiry({ ...inquiry, message: "" });
    } catch (err) {
      setInquiryStatus({
        loading: false,
        success: false,
        error: "Gửi yêu cầu thất bại. Vui lòng thử lại sau!",
      });
    }
  };
  // to start a chat
  const handleChatStart = async () => {
    if (!user) return navigate("/login");
    if (user.role !== "buyer")
      return alert("Chỉ người mua mới có thể bắt đầu trò chuyện!");
    try {
      const res = await axios.post(
        `${API_URL}api/chat/start`,
        { propertyID: id, sellerId: property.seller._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const chat = res.data;
      await axios.post(
        `${API_URL}api/chat/send`,
        {
          chatId: chat._id,
          text: `Xin chào! Tôi quan tâm đến bất động sản "${property.title}". Bạn có thể cung cấp thêm thông tin chi tiết không?`,
          image: property.images?.[0] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(`/chat-messages`, { state: { chat } });
    } catch (err) {
      alert("Không thể bắt đầu trò chuyện. Vui lòng thử lại sau!");
    }
  };
  const [lightboxIndex, setLightboxIndex] = useState(null);
  if (loading)
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  if (error || !property)
    return (
      <div
        className="container"
        style={{ padding: "4rem", textAlign: "center" }}
      >
        {error || "Không tìm thấy bất động sản!"}
      </div>
    );

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(property.price);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length,
    );

  return (
    <div className={s.pageContainer}>
      <Navbar />
      <main className={s.mainContainer}>
        <nav className={s.breadcrumbs}>
          <Link to="/" className={s.breadcrumbLink}>
            Trang chủ
          </Link>
          <HiChevronRight />
          <Link to="/properties" className={s.breadcrumbLink}>
            Danh sách
          </Link>
          <HiChevronRight />
          <span className={s.breadcrumbCurrent}>{property.title}</span>
        </nav>
        <div className={s.galleryContainer}>
          <div
            className={s.galleryGrid}
            style={{
              gridTemplateColumns:
                property.images.length > 1 ? "repeat(4, 1fr)" : "1fr",
              gridTemplateRows:
                property.images.length > 1 ? "repeat(2, 180px)" : "400px",
            }}
          >
            <div
              className={s.galleryMainItem(property.images.length > 1)}
              onClick={() => openLightbox(0)}
            >
              <img
                src={property.images[0]}
                alt="property image"
                className={s.galleryImage}
              />
            </div>
            {property.images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className={s.gallerySideItem}
                onClick={() => openLightbox(idx + 1)}
              >
                <img src={img} alt="img" className={s.galleryImage} />
                {idx === 3 && property.images.length > 5 && (
                  <div className={s.galleryMoreOverlay}>
                    +{property.images.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={s.mobileSliderContainer}>
            <div className={s.mobileSliderTrack}>
              {property.images.map((img, idx) => (
                <div
                  key={idx}
                  className={s.mobileSlide}
                  onClick={() => openLightbox(idx)}
                >
                  <img src={img} alt="imgs" className={s.mobileSlideImage} />
                  <div className={s.mobileSlideCounter}>
                    {idx + 1} / {property.images.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* lightbox model */}
        {lightboxIndex !== null && (
          <div className={s.lightboxOverlay} onClick={closeLightbox}>
            <button onClick={closeLightbox} className={s.lightboxCloseBtn}>
              <HiX size={24} className={s.lightboxCloseIcon} />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className={s.lightboxContent}
            >
              <img
                src={property.images[lightboxIndex]}
                alt="imgs"
                className={s.lightboxImage}
              />
              {property.images.length > 1 && (
                <>
                  <button onClick={prevImage} className={s.lightboxPrevBtn}>
                    <HiChevronLeft size={30} />
                  </button>
                  <button onClick={nextImage} className={s.lightboxNextBtn}>
                    <HiChevronRight size={30} />
                  </button>
                </>
              )}
              <div className={s.lightboxCounter}>
                {lightboxIndex + 1}/{property.images.length}
              </div>
            </div>
          </div>
        )}

        {/* main content */}
        <div className={s.detailsLayout}>
          <div className={s.infoColumn}>
            <div className={s.infoHeader}>
              <div className={s.titleWrapper}>
                <div className={s.badgeWrapper}>
                  <span className={s.premiumBadge}>Danh sách cao cấp</span>
                </div>
                <h1 className={s.propertyTitle}>{property.title}</h1>
                <p className={s.propertyLocation}>
                  <HiLocationMarker className={s.locationIcon} />
                  <span className={s.locationText}>
                    {property.area},{property.city} ,Việt Nam
                  </span>
                </p>
              </div>
              <div className={s.actionButtons}>
                {(!user || user.role === "buyer") && (
                  <button
                    onClick={handleWishlistToggle}
                    className={s.wishlistButton(isInWishlist)}
                  >
                    {isInWishlist ? (
                      <HiHeart size={26} fill="#ef4444" />
                    ) : (
                      <HiOutlineHeart size={26} />
                    )}
                  </button>
                )}
              </div>
            </div>
            {/* quick stats */}
            <div className={s.statsGrid}>
              {[
                {
                  label: "Bedrooms",
                  value: property.bhk || 0,
                  icon: HiOutlineHome,
                },
                {
                  label: "Bathrooms",
                  value:
                    property.bathrooms ||
                    Math.max(1, (parseInt(property.bhk) || 1) - 1),
                  icon: HiOutlineUserGroup,
                },
                {
                  label: "Furnishing",
                  value: property.furnishing || "N/A",
                  icon: HiCollection,
                },
                {
                  label: "Living Area",
                  value: `${property.areaSize} sqft`,
                  icon: HiOutlineViewGrid,
                },
                {
                  label: "Type",
                  value: property.propertyType,
                  icon: HiCalendar,
                },
              ].map((stat, i) => (
                <div key={i} className={s.statCard}>
                  {stat.icon && <stat.icon size={18} className={s.statIcon} />}
                  <div className={s.statValue}>{stat.value}</div>
                  <div className={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div className={s.descriptionSection}>
              <h3 className={s.sectionTitle}>Mô tả </h3>
              <p className={s.descriptionText}>
                {property.description || "Không có mô tả!"}
              </p>
            </div>
            <div className={s.amenitiesSection}>
              <h3 className={s.sectionTitle}>Tiện ích</h3>
              <div className={s.amenitiesGrid}>
                {(property.amenities?.length
                  ? property.amenities
                  : ["Parking", "Security", "Water Supply", "Power Backup"]
                ).map((amn, i) => (
                  <div key={i} className={s.amenityItem}>
                    <HiBadgeCheck size={18} className={s.amenityIcon} />
                    <span className={s.amenityText}>{amn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={s.sidebarColumn}>
            <div
              className={s.priceCard}
              style={{ background: "var(--primary)" }}
            >
              <div className={s.priceCardLabel}>
                {property.status?.toLowerCase() === "rent"
                  ? "Rental Details"
                  : "Giá sản phẩm"}
              </div>
              <div className={s.priceCardValue}>
                {property.status?.toLowerCase() === "rent"
                  ? `${Number(property.price).toLocaleString("vi-VN")}`
                  : formattedPrice}{" "}
                VND
                {property.status?.toLowerCase() === "rent" && (
                  <span className={s.priceCardPeriod}> /month</span>
                )}
              </div>
              {property.status?.toLowerCase() === "rent" && (
                <div className={s.rentDetails}>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Khoản đặt cọc</span>
                    <span className={s.rentDetailValue}>
                      {Number(property.securityDeposit || 0).toLocaleString(
                        "vi-VN",
                      )}
                      VNĐ
                    </span>
                  </div>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Phí bảo trì</span>
                    <span className={s.rentDetailValue}>
                      {Number(property.maintenance || 0).toLocaleString(
                        "vi-VN",
                      )}
                      VNĐ /mo
                    </span>
                  </div>
                </div>
              )}
              <div className={s.priceCardAvailability}>
                Đang mở bán{" "}
                {property.status?.toLowerCase() === "rent" ? "Rent" : "Sale"}
              </div>
            </div>
            {/* seller & contact */}
            <div className={s.sellerCard}>
              <div className={s.sellerInfo}>
                <div className={s.sellerAvatar}>
                  <img
                    src={
                      property.seller?.profilePic ||
                      `https://ui-avatars.com/api/?name=${property.seller?.name || "Seller"}&background=0d6e59&color=fff`
                    }
                    alt="Agent"
                    className={s.sellerAvatarImage}
                  />
                </div>
                <div className={s.sellerDetails}>
                  <div className={s.sellerNameLink}>
                    <h4 className={s.sellerName}>
                      {property.seller?.name || "Seller"}
                    </h4>
                  </div>
                  <div className={s.sellerVerifiedBadge}>
                    <HiBadgeCheck className={s.verifiedIcon} /> Verified Seller
                  </div>
                </div>
              </div>

              <div className={s.chatButtonWrapper}>
                <button className={s.chatButton} onClick={handleChatStart}>
                  <HiChatAlt /> Chat
                </button>
              </div>

              {/* Inquiry Form */}
              <h4 className={s.inquiryFormTitle}>Liên hệ</h4>
              <form onSubmit={handleInquirySubmit}>
                {user?.role === "buyer" ? (
                  <>
                    <textarea
                      placeholder="Your Message..."
                      value={inquiry.message}
                      onChange={(e) =>
                        setInquiry({ ...inquiry, message: e.target.value })
                      }
                      className={s.inquiryTextarea}
                      required
                    />
                    <button
                      type="submit"
                      className={s.inquirySubmitButton}
                      disabled={inquiryStatus.loading}
                    >
                      {inquiryStatus.loading ? "Sending..." : "Send Inquiry"}
                    </button>
                    {inquiryStatus.success && (
                      <p className={s.inquirySuccessMessage}>Inquiry sent!</p>
                    )}
                  </>
                ) : (
                  <div className={s.inquiryDisabledMessage}>
                    <p className={s.inquiryDisabledText}>
                      {user
                        ? "Chỉ người mua được gửi yêu cầu."
                        : "Đăng nhập để liên hệ với người mua."}
                    </p>
                    {!user && (
                      <Link to="/login" className={s.inquiryLoginButton}>
                        Login
                      </Link>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
        <div className={s.additionalDetails}>
          <h3 className={s.detailsTitle}>Thông tin chi tiết</h3>
          <div className={s.detailsGrid}>
            {[
              {
                label: "ID",
                value: property._id.slice(-8).toUpperCase(),
              },
              {
                label: "Được thêm vào ngày",
                value: new Date(property.createdAt).toLocaleDateString(),
              },
              { label: "Kiểu BDS", value: property.propertyType },
              { label: "Trạng thái", value: `For ${property.status}` },
            ].map((detail, i) => (
              <div key={i} className={s.detailRow}>
                <span className={s.detailLabel}>{detail.label}</span>
                <span className={s.detailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
        <section className={s.similarSection}>
          <div className={s.similarHeader}>
            <div>
              <h2 className={s.similarTitle}>Bất động sản tương tự</h2>
              <p className={s.similarSubtitle}>
                Có thể bạn quan tâm {property.city}.
              </p>
            </div>

            <Link to="/properties" className={s.similarAllLink}>
              Tất cả danh sách <HiChevronRight />
            </Link>
          </div>
          <div className={s.similarGrid}>
            {similarProperties.length > 0 ? (
              similarProperties
                .slice(0, 3)
                .map((p) => <PropertyCard key={p._id} property={p} />)
            ) : (
              <div className={s.similarEmptyState}>
                Không có BDS tương tự ở địa điểm này.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PropertyDetails;
