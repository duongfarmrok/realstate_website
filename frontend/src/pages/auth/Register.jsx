import React, { useState } from "react";
import { registerStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };
  //to submit the data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const result = await register(formData);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate("/verify-email", { state: { email: formData.email } });
      }, 1500);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className={s.pageWrapper}>
      <Navbar />
      <div className={s.container}>
        <div className={s.formCard}>
          <h2 className={s.heading}>Taọ tài khoản</h2>
          <p className={s.subheading}>
            Kết nối cộng đồng mua bán bất động sản.
          </p>
          {error && <div className={s.error}>{error}</div>}
          {success && <div className={s.success}>{success}</div>}
          <form onSubmit={handleSubmit} className={s.form}>
            <div>
              <label className={s.label}>Tên đầy đủ</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={s.input}
                placeholder="Nhập tên của bạn"
                required
              />
            </div>

            <div>
              <label className={s.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={s.input}
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <label className={s.label}>Mật khẩu</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="* * * * * * *"
                  onChange={handleChange}
                  className={s.input}
                  value={formData.password}
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
              <label className="block mb-3 font-medium">Vai trò</label>
              <div className={s.roleContainer}>
                <label
                  className={`${s.roleLabelBase} ${
                    formData.role === "buyer"
                      ? s.roleLabelActive
                      : s.roleLabelInactive
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={formData.role === "buyer"}
                    onChange={handleChange}
                    className={s.hiddenRadio}
                  />
                  Người mua
                </label>

                <label
                  className={`${s.roleLabelBase} ${
                    formData.role === "seller"
                      ? s.roleLabelActive
                      : s.roleLabelInactive
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === "seller"}
                    onChange={handleChange}
                    className={s.hiddenRadio}
                  />
                  Người bán
                </label>
              </div>
            </div>
            <button
              className={s.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>
          <p className={s.footerText}>
            Đã có tài khoản{" "}
            <Link to="/login" className={s.loginLink}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
