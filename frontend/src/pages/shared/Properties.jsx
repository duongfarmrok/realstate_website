import React, { useEffect, useState, useRef } from "react";
import { propertiesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import {
  HiAdjustments,
  HiFilter,
  HiSearch,
  HiViewGrid,
  HiViewList,
  HiX,
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";
import PropertyCard from "../../components/common/PropertyCard";

const Properties = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const [filters, setFilters] = useState({
    city: "",
    propertyType: [],
    bhk: "",
    maxPrice: 50000000000,
    amenities: [],
    furnishing: [],
    sort: "latest",
  });

  const propertyTypes = [
    { label: "Căn hộ / Chung cư", value: "flat" },
    { label: "Nhà riêng / Biệt thự", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Mặt bằng thương mại", value: "commercial" },
  ];
  const bhkOptions = ["1", "2", "3", "4", "5+"];
  const furnishingOptions = [
    { label: "Đầy đủ nội thất", value: "furnished" },
    { label: "Nội thất cơ bản", value: "semi-furnished" },
    { label: "Nhà trống / Không nội thất", value: "unfurnished" },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const city = queryParams.get("city") || "";
    const type = queryParams.get("type") || "";
    const bhk = queryParams.get("bhk") || "";

    const initialFilters = {
      ...filters,
      city,
      propertyType: type ? [type] : [],
      bhk,
    };
    setFilters(initialFilters);
    fetchProperties(initialFilters);
    if (user) {
      fetchWishlist();
    }
  }, [location.search, user]);

  // const fetchWishlist = async () => {
  //   try {
  //     const res = await axios.get(`${API_URL}api/wishlist`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setWishlistedIds(
  //       res.data
  //         .filter((item) => item.property)
  //         .map((item) => String(item.property._id)),
  //     );
  //   } catch (error) {
  //     console.error("Failed to fetch wishlist:", error);
  //   }
  // };

  const fetchWishlist = async () => {
    if (!user || !token) return;

    try {
      const res = await axios.get(`${API_URL}api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Xử lý response đúng cấu trúc { success: true, data: [] }
      const wishlistData =
        res.data?.data || res.data?.wishlist || res.data || [];

      setWishlistedIds(
        wishlistData
          .filter((item) => item?.property?._id)
          .map((item) => item.property._id),
      );
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích", error);
      setWishlistedIds([]); // Tránh crash UI
    }
  };

  //to toggle wishlist
  // const handleToggleWishlist = async (propertyId) => {
  //   try {
  //     const isWishlisted = wishlistedIds.includes(propertyId);

  //     if (isWishlisted) {
  //       await axios.delete(`${API_URL}api/wishlist/${propertyId}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       setWishlistedIds((prev) => prev.filter((id) => id !== propertyId));
  //     } else {
  //       await axios.post(
  //         `${API_URL}api/wishlist/${propertyId}`,
  //         {},
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         },
  //       );
  //       setWishlistedIds((prev) => [...prev, propertyId]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to update wishlist:", error);
  //   }
  // };

  const handleToggleWishlist = async (propertyId) => {
    if (!user || !token) {
      navigate("/login"); // hoặc alert("Vui lòng đăng nhập")
      return;
    }

    try {
      const isWishlisted = wishlistedIds.includes(propertyId);

      if (isWishlisted) {
        await axios.delete(`${API_URL}api/wishlist/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          `${API_URL}api/wishlist/${propertyId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      // Cập nhật state
      setWishlistedIds((prev) =>
        isWishlisted
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId],
      );
    } catch (error) {
      console.error("Lỗi toggle wishlist:", error);
      alert("Có lỗi khi cập nhật yêu thích. Vui lòng thử lại!");
    }
  };

  //to fetch properties
  const fetchProperties = async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.propertyType.length > 0)
        params.append("propertyType", currentFilters.propertyType.join(","));
      if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.furnishing && currentFilters.furnishing.length > 0)
        params.append("furnishing", currentFilters.furnishing.join(","));
      if (currentFilters.sort) params.append("sort", currentFilters.sort);

      const res = await axios.get(
        `${API_URL}api/property?${params.toString()}`,
      );
      setProperties(res.data.properties);
      setError(null);
    } catch (err) {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const fetchTimer = useRef(null);

  const debouncedFetch = (updatedFilters) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchProperties(updatedFilters);
    }, 500);
  };

  const handleCheckboxChange = (category, value) => {
    const current = [...(filters[category] || [])];
    const index = current.indexOf(value);
    if (index === -1) {
      current.push(value);
    } else {
      current.splice(index, 1);
    }
    const updatedFilters = { ...filters, [category]: current };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    const updatedFilters = { ...filters, maxPrice: value };
    setFilters(updatedFilters);
    debouncedFetch(updatedFilters);
  };

  const handleBhkSelect = (value) => {
    const updatedFilters = {
      ...filters,
      bhk: filters.bhk === value ? "" : value,
    };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const updatedFilters = { ...filters, sort: newSort };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const applyFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchProperties(filters);
  };

  const resetFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    const reset = {
      city: "",
      propertyType: [],
      bhk: "",
      maxPrice: 50000000000,
      amenities: [],
      furnishing: [],
      sort: "latest",
    };
    setFilters(reset);
    navigate("/properties");
    fetchProperties(reset);
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  return (
    <div className={s.pageContainer}>
      <Navbar />
      <div className={s.container}>
        <div className={s.mobileFilterButtonWrapper}>
          <button
            onClick={() => setShowMobileFilters(true)}
            className={s.mobileFilterButton}
          >
            <HiFilter /> Bộ lọc và tìm kiếm
          </button>
        </div>
        <div className={s.layout}>
          <aside
            className={`${s.sidebar} ${showMobileFilters ? s.sidebarVisible : s.sidebarHidden}`}
          >
            <div className={s.sidebarHeader}>
              <div className={s.sidebarTitleWrapper}>
                <HiFilter className={s.sidebarTitleIcon} />
                <h2 className={s.sidebarTitle}>Bộ lọc</h2>
              </div>
              <div className={s.sidebarHeaderActions}>
                <button onClick={resetFilters} className={s.resetButton}>
                  Reset
                </button>
                <button
                  className={s.closeMobileFilters}
                  onClick={() => setShowMobileFilters(false)}
                >
                  <HiX />
                </button>
              </div>
            </div>
            <div className={s.filtersScrollArea}>
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Địa điểm</label>
                <div className={s.searchInputWrapper}>
                  <HiSearch className={s.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thành phố..."
                    value={filters.city}
                    onChange={(e) => {
                      const updatedFilters = {
                        ...filters,
                        city: e.target.value,
                      };
                      setFilters(updatedFilters);
                      debouncedFetch(updatedFilters);
                    }}
                    className={s.searchInput}
                  />
                </div>
              </div>

              {/* Price Range Section */}
              <div className={s.filterSection}>
                <div className={s.priceHeader}>
                  <label className={s.filterLabel}>Khoảng giá tối đa</label>
                  <span className={s.priceValue}>
                    {filters.maxPrice >= 1000000000
                      ? `${(filters.maxPrice / 1000000000).toFixed(1)} tỷ VND`
                      : `${(filters.maxPrice / 1000000).toLocaleString()} triệu VND`}
                  </span>
                </div>

                <input
                  type="range"
                  min="1000000"
                  max="50000000000"
                  step="1000000"
                  onChange={handlePriceChange}
                  className={s.priceSlider}
                />

                <div className={s.priceLabels}>
                  <span>1 Tr</span>
                  <span>50 Tỷ</span>
                </div>
              </div>

              {/* property Type */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Loại bất động sản</label>
                <div className={s.checkboxGroup}>
                  {propertyTypes.map((type) => (
                    <label key={type.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.propertyType.includes(type.value)}
                        onChange={() =>
                          handleCheckboxChange("propertyType", type.value)
                        }
                        className={s.checkbox}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* BHK */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>BHK (Phòng ngủ)</label>
                <div className={s.bhkGroup}>
                  {bhkOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleBhkSelect(option)}
                      className={`${s.bhkButton} ${
                        filters.bhk === option
                          ? s.bhkButtonActive
                          : s.bhkButtonInactive
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className={s.filterSection}>
                <label className={s.filterLabel}>Nội thất</label>
                <div className={s.checkboxGroup}>
                  {furnishingOptions.map((option) => (
                    <label key={option.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.furnishing?.includes(option.value)}
                        onChange={() =>
                          handleCheckboxChange("furnishing", option.value)
                        }
                        className={s.checkbox}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* main content */}

          <main className={s.mainContent}>
            <div className={s.contentHeader}>
              <div>
                <span className={s.resultCount}>
                  Đang hiển thị{" "}
                  <strong className={s.resultCountStrong}>
                    {loading ? "..." : properties.length}
                  </strong>{" "}
                  Bất động sản
                </span>
              </div>
              <div className={s.headerControls}>
                <div className={s.viewModeToggle}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`${s.viewModeButton} ${
                      viewMode === "grid"
                        ? s.viewModeActive
                        : s.viewModeInactive
                    }`}
                  >
                    <HiViewGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`${s.viewModeButton} ${
                      viewMode === "list"
                        ? s.viewModeActive
                        : s.viewModeInactive
                    }`}
                  >
                    <HiViewList size={20} />
                  </button>
                </div>
                <div className={s.sortControl}>
                  <span className={s.sortLabel}>Sắp xếp:</span>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className={s.sortSelect}
                  >
                    <option value="latest">Latest</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
            {/* property grid */}
            {loading ? (
              <div className={s.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={s.skeletonCard}></div>
                ))}
              </div>
            ) : error ? (
              <div className={s.errorContainer}>
                <HiX size={48} className={s.errorIcon} />
                <h3 className={s.errorTitle}>{error}</h3>
                <button onClick={applyFilters} className={s.errorButton}>
                  Thử lại
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className={s.emptyContainer}>
                <div className={s.emptyIconWrapper}>
                  <HiAdjustments size={32} className={s.emptyIcon} />
                </div>
                <h2 className={s.emptyTitle}>Không tìm thấy BĐS</h2>
                <p className={s.emptyText}>Mở rộng phạm vi tìm kiếm</p>
                <button onClick={resetFilters} className={s.emptyButton}>
                  Làm mới
                </button>
              </div>
            ) : (
              <div
                className={`${s.propertyList} ${
                  viewMode === "grid" ? s.propertyListGrid : s.propertyListList
                }`}
              >
                {properties
                  .filter((p) => p)
                  .map((p) => (
                    <PropertyCard
                      key={p._id}
                      property={p}
                      isWishlisted={wishlistedIds.includes(String(p._id))}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
              </div>
            )}
          </main>
        </div>
      </div>
      {showMobileFilters && (
        <div
          onClick={() => setShowMobileFilters(false)}
          className={s.mobileOverlay}
        />
      )}
    </div>
  );
};

export default Properties;
