import React, { useState } from "react";
import { forgotPasswordStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import axios from "axios";
import API_URL from "../../config";
import { Link } from "react-router-dom";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //to submit the email to get the rest link
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${API_URL}api/auth/forgot-password`, {
        email,
      });
      if (res.data.success) {
        setSuccess(
          res.data.message ||
            "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
        );
      }
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
          <h2 className={s.title}>Quên mật khẩu</h2>
          <p className={s.subtitle}>
            Nhập địa chỉ email để nhận liên kết đặt lại mật khẩu
          </p>

          {error && <div className={s.errorMessage}>{error}</div>}
          {success && <div className={s.successMessage}>{success}</div>}

          <form onSubmit={handleSubmit} className={s.form}>
            <div>
              <label className={s.label}>Email</label>
              <input
                type="email"
                className={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
            </div>
            <button
              className={s.submitButton}
              type="submit"
              disabled={isLoading}
            >
                {isLoading ? "Đang gửi..." : "Gửi liên kết"}
            </button>
          </form>
          <p className={s.footerText}>
            Đã nhớ mật khẩu? {""}
            <Link
                to='/login'
                className={s.link}
                
            >Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
