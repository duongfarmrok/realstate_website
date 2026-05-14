import React, { useState } from "react";
import { addPropertyStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";
import { HiUpload } from "react-icons/hi";

const AddProperty = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    area: "",
    pincode: "",
    propertyType: "flat",
    bhk: "",
    bathrooms: "",
    areaSize: "",
    furnishing: "unfurnished",
    status: "sale",
    amenities: [],
    securityDeposit: "",
    maintenance: "",
  });

  const commonAmenities = [
    "Chỗ để xe",
    "Hồ bơi",
    "Phòng tập Gym",
    "An ninh 24/7",
    "Wifi / Internet",
    "Điện dự phòng",
    "Khu sinh hoạt chung",
    "Sân vườn / Cảnh quan",
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  //img handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      setError("Tải tối đa 10 ảnh!");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  //to remove an img
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  //to submit and create a new listings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "amenities") {
        formData[key].forEach((a) => data.append("amenities", a));
      } else {
        data.append(key, formData[key]);
      }
    });
    images.forEach((img) => data.append("images", img));

    try {
      await axios.post(`${API_URL}api/property`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Thêm sản phẩm thất bại !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.outerContainer}>
      <div className={s.innerContainer}>
        <div className={s.header}>
          <h1 className={s.heading}>Đăng tin cho thuê/bán</h1>
          <p className={s.subheading}>
            Hoàn tất thông tin dưới đây để tiếp cận hàng nghìn khách hàng tiềm
            năng.
          </p>
        </div>
        <form onSubmit={handleSubmit} className={s.form}>
          {error && <div className={s.error}>{error}</div>}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderLargeMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Nội dung & Mô tả</h3>
            </div>
            <div className={s.contentGroupLarge}>
              <div>
                <label className={s.label}>Tiêu đề BĐS</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề cho BĐS"
                  className={s.input}
                  required
                />
              </div>
              <div>
                <label className={s.label}>Mô tả chi tiết</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả những điểm nổi bật của bất động sản..."
                  className={`${s.input} ${s.textarea}`}
                  required
                ></textarea>
              </div>
            </div>
          </div>
          <div className={s.twoColumnGrid}>
            <div>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>
                <h3 className={s.sectionTitle}>Chi tiết BĐS</h3>
              </div>
              <div className={s.contentGroupMedium}>
                <div>
                  <label className={s.labelSmallMargin}>Loại BĐS</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className={`${s.input} ${s.select}`}
                  >
                    <option value="flat">Căn hộ / Chung cư</option>
                    <option value="villa">Nhà riêng / Biệt thự</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="commercial">Thương mại / Văn phòng</option>
                  </select>
                </div>
                <div className={s.gridThreeCol}>
                  <div>
                    <label className={s.labelSmallMargin}>BHK</label>
                    <input
                      type="number"
                      name="bhk"
                      value={formData.bhk}
                      onChange={handleInputChange}
                      placeholder="Nhập số lượng BHK..."
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Phòng tắm</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms || ""}
                      onChange={handleInputChange}
                      placeholder="Nhập số lượng phòng tắm..."
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Diện tích (m²)</label>
                    <input
                      type="number"
                      name="areaSize"
                      value={formData.areaSize}
                      onChange={handleInputChange}
                      placeholder="Nhập diện tích...m²"
                      className={s.input}
                      required
                    />
                  </div>
                </div>
                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>
                      Tình trạng nội thất
                    </label>
                    <select
                      name="furnishing"
                      value={formData.furnishing}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="unfurnished">Nhà trống</option>
                      <option value="semi-furnished">Nội thất cơ bản</option>
                      <option value="furnished">Nội thất đầy đủ</option>
                    </select>
                  </div>
                  <div>
                    <label className={s.labelSmallMargin}>
                      Trạng thái tin đăng
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="sale">Đang mở bán</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>
                <h3 className={s.sectionTitle}>Giá bán & Địa điểm</h3>
              </div>
              <div className={s.contentGroupSmall}>
                <div>
                  <label className={s.labelSmallMargin}>Giá (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Nhập giá..."
                    className={s.input}
                    required
                  />
                </div>
                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>Thành phố</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Nhập thành phố..."
                      className={s.input}
                      required
                    />
                  </div>
                  <div>
                    <label className={s.labelSmallMargin}>Mã bưu chính</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Nhập mã bưu chính..."
                      className={s.input}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={s.labelSmallMargin}>Khu vực cụ thể</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Nhập khu vực cụ thể..."
                    className={s.input}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Tiện ích</h3>
            </div>

            <div className={s.amenitiesGrid}>
              {commonAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className={`${s.amenityLabelBase}
                    ${
                      formData.amenities.includes(amenity)
                        ? s.amenityLabelActive
                        : s.amenityLabelInactive
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className={s.amenityCheckbox}
                  />
                  <span
                    className={`${s.amenityTextBase} ${
                      formData.amenities.includes(amenity)
                        ? s.amenityTextActive
                        : s.amenityTextInactive
                    }`}
                  >
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Hình ảnh BĐS</h3>
            </div>

            <div className={s.uploadArea}>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
              <div className={s.uploadIconWrapper}>
                <HiUpload size={40} color="#64748b" />
              </div>
              <h4 className={s.uploadTitle}>
                Nhấp để tải lên hoặc kéo và thả vào đây
              </h4>
              <p className={s.uploadSubtext}>
                Tải lên tối đa 10 hình ảnh chất lượng cao (PNG, JPG)
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className={s.previewsGrid}>
                {imagePreviews.map((src, i) => (
                  <div key={i} className={s.previewItem}>
                    <img
                      src={src}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className={s.removeButton}
                      style={{
                        transform: "rotate(45deg)",
                      }}
                    >
                      <HiUpload size={12} />
                    </button>
                  </div>
                ))}

                {images.length < 10 && (
                  <div className={s.addMoreBox}>
                    <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    <HiUpload size={20} color="#64748b" />
                    <span className={s.addMoreText}>Thêm</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={s.footerButtons}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={s.cancelButton}
            >
              Hủy
            </button>

            <button type="submit" className={s.submitButton} disabled={loading}>
              {loading ? "Đang đăng tải..." : "Đăng tải!"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
