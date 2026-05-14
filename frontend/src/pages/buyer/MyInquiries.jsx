import React, { useEffect, useState } from "react";
import { myInquiriesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";
import Navbar from "../../components/common/Navbar";
import {
  HiCalendar,
  HiChatAlt2,
  HiCheckCircle,
  HiExternalLink,
  HiHome,
  HiMail,
  HiOutlineChatAlt2,
  HiUser,
} from "react-icons/hi";

const MyInquires = () => {
  const { user, token } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy danh sách yêu cầu liên hệ (inquiry) từ phía server
  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;
      try {
        const endpoint = user?.role === "seller" ? "seller" : "my";
        const res = await axios.get(`${API_URL}api/inquiry/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInquiries(res.data.inquiries || []);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu!", error);
        setError(
          error.response?.data?.message || "Lỗi khi tải dữ liệu / tải trang ",
        );
        setLoading(false);
      }
    };
    fetchInquiries();
  }, [user, token]);

  // đánh dấu là đã đọc từ seller
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${API_URL}api/inquiry/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInquiries(
        inquiries.map((inq) =>
          inq._id === id ? { ...inq, isRead: true } : inq,
        ),
      );
    } catch (error) {
      console.error("Đánh dấu thất bại!");
    }
  };

  const handleStartChat = async (inq) => {
    try {
      const res = await axios.post(
        `${API_URL}api/chat/start`,
        {
          propertyId: inq.property?._id,
          buyerId: inq.buyer?._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      navigate("/chat-messages", { state: { char: res.data } });
    } catch (error) {
      console.error("Bắt đầu trò chuyện thất bại!", error);
      alert("Bắt đầu trò chuyện thất bại!Thử lại sau!");
    }
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  if (error)
    return (
      <div
        className={
          user?.role !== "seller" ? s.bgBgAltMinH : s.bgTransparentMinH
        }
      >
        {user?.role !== "seller" && <Navbar />}
        <div className={s.containerPy12TextCenter}>
          <div className={s.cardPremiumPy16Px8}>
            <h2 className={s.textDangerMb4}>Lỗi</h2>
            <p className={s.mb8}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={s.btnPrimary}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );

  const isSeller = user?.role === "seller";

  return (
    <div
      className={user?.role !== "seller" ? s.bgBgAltMinH : s.bgTransparentHAuto}
    >
      {user?.role !== "seller" && <Navbar />}
      <div
        className={`${s.containerFadeIn} ${
          user?.role !== "seller" ? s.py12Pt12 : s.pt0
        }`}
      >
        <div className={s.mb12}>
          <h1 className={s.heading}>
            {isSeller ? "Phản hồi của khách hàng" : "My Inquiries"}
          </h1>
          <p className={s.textMuted}>
            {isSeller
              ? "Xem và phản hồi các quan tâm về bất động sản của bạn"
              : "Theo dõi trạng thái các yêu cầu tư vấn BĐS của bạn"}
          </p>
        </div>

        {inquiries.length === 0 ? (
          <div className={s.cardPremiumPy24Px8TextCenter}>
            <div className={s.iconContainer}>
              <HiOutlineChatAlt2 size={40} />
            </div>
            <h2 className={s.mb4}>
              Không có yêu cầu nào {isSeller ? "được nhận" : "đã gửi"}
            </h2>
            <p className={s.textMutedMb8}>
              {isSeller
                ? "Bạn chưa có yêu cầu nào. Tin đăng hấp dẫn sẽ nhận được nhiều lượt quan tâm hơn!"
                : "Bạn chưa liên hệ người bán nào. Đang quan tâm bất động sản? Hãy gửi yêu cầu ngay!"}
            </p>

            <Link to="/" className={s.btnPrimary}>
              {isSeller
                ? "Cải thiện tin đăng của tôi"
                : "Tìm kiếm bất động sản"}
            </Link>
          </div>
        ) : (
          <div className={s.flexColGap6}>
            {inquiries.map((inq) => (
              <div key={inq._id} className={s.inquiryCard}>
                <div className={s.inquiryMain}>
                  <div className={s.iconWrapper}>
                    <HiHome className={s.iconSize} />
                  </div>
                  <div className={s.flex1}>
                    <div className={s.titleRow}>
                      <h3 className={s.titleText}>{inq.property?.title}</h3>
                      <span
                        className={`${s.badge} ${
                          inq.isRead ? s.badgeRead : s.badgeNew
                        }`}
                      >
                        {inq.isRead ? "Đọc" : "Mới"}
                      </span>
                    </div>
                    {isSeller && (
                      <div className={s.buyerInfo}>
                        <div className={s.infoItem}>
                          <HiUser className={s.textMutedSmall} />{" "}
                          <span className={s.fontSemibold}>
                            {inq.buyer?.name}
                          </span>
                        </div>
                        <div className={s.infoItem}>
                          <HiMail className={s.textMutedSmall} />{" "}
                          {inq.buyer?.phone || "Không cung cấp SĐT"}
                        </div>
                      </div>
                    )}

                    <p className={s.message}>"{inq.message}"</p>
                    <div className={s.meta}>
                      <div className={s.flexItemsCenterGap2}>
                        <HiCalendar size={16} />{" "}
                        {isSeller ? "Đã nhận" : "Đã gửi"} on{" "}
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </div>

                      {!isSeller && (
                        <div className={s.flexItemsCenterGap2}>
                          <HiCheckCircle size={16} />{" "}
                          {inq.isRead
                            ? "Người bán đã xem"
                            : "Đợi phản hồi từ người bán"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={s.actions}>
                  <Link
                    to={`/property/${inq.property?._id}`}
                    className={s.btnOutline}
                  >
                    Xem BĐS <HiExternalLink />
                  </Link>

                  {isSeller && !inq.isRead && (
                    <button
                      onClick={() => markAsRead(inq._id)}
                      className={s.btnPrimaryWhitespaceNowrap}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}

                  {isSeller && (
                    <button
                      onClick={() => handleStartChat(inq)}
                      className={s.btnMessage}
                    >
                      <HiChatAlt2 /> Tin nhắn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInquires;
