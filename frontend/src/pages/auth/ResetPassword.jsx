import React, { useState } from "react";
import { resetPasswordStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { HiEye, HiEyeOff } from "react-icons/hi";
import API_URL from "../../config";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { token } = useParams();

  //to submit the new password
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        `${API_URL}api/auth/reset-password/${token}`,
        { password },
      );
      if (res.data.success) {
        setSuccess(res.data.message || "Mật khẩu đã được đặt lại thành công.");
      }
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={s.container}>
      <Navbar />
      <div className={s.centerWrapper}>
        <div className={s.formCard}>
          <h2 className={s.title}>Đặt lại mật khẩu</h2>
          <p className={s.subtitle}>Tạo mật khẩu mới cho tài khoản của bạn</p>

          {error && <div className={s.errorMessage}>{error}</div>}
          {success && <div className={s.successMessage}>{success}</div>}
          <form onSubmit={handleSubmit} className={s.form}>
            <div>
              <label className={s.label}>Mật khẩu mới</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={s.input}
                  placeholder="******"
                  required
                  style={{ paddingRight: "40px" }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className={s.label}>Xác nhận mật khẩu</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={s.input}
                  placeholder="******"
                  required
                  style={{ paddingRight: "40px" }}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showConfirmPassword ? (
                    <HiEyeOff size={20} />
                  ) : (
                    <HiEye size={20} />
                  )}
                </button>
              </div>
            </div>
            <button
              className={s.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
          </form>
          <p className={s.footerText}>
            Quay trở lại{" "}
            <Link to="/login" className={s.link}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
