import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProductDetail = async () => {
      try {
        setIsLoading(true);
        setError("");
        // Public endpoint untuk melihat detail produk dari QR code
        // Tidak perlu credentials karena endpoint public
        const response = await axios.get(`${API_BASE_URL}/products/${id}/detail`, {
          withCredentials: false
        });
        setProduct(response.data);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            setError("Produk tidak ditemukan");
          } else {
            setError(error.response.data.msg || "Gagal memuat data produk");
          }
        } else {
          setError("Gagal memuat data produk");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      getProductDetail();
    }
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "2rem 0" }}>
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-half">
            {isLoading ? (
              <div className="box has-text-centered">
                <span className="icon is-large">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </span>
                <p className="mt-4">Memuat informasi produk...</p>
              </div>
            ) : error ? (
              <div className="box">
                <div className="notification is-danger is-light">
                  <p className="title is-5">
                    <span className="icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>
                    Error
                  </p>
                  <p>{error}</p>
                  <div className="buttons mt-4">
                    <button className="button is-light" onClick={() => window.location.href = "/"}>
                      <span className="icon">
                        <i className="fas fa-home"></i>
                      </span>
                      <span>Kembali ke Home</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : product ? (
              <div className="box" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <div className="has-text-centered mb-5">
                  <div className="has-background-primary" style={{ 
                    width: "80px", 
                    height: "80px", 
                    borderRadius: "50%", 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginBottom: "1rem"
                  }}>
                    <span className="icon is-large has-text-white">
                      <i className="fas fa-box fa-2x"></i>
                    </span>
                  </div>
                  <h1 className="title is-3 mt-4">Informasi Produk</h1>
                  <p className="subtitle is-6 has-text-grey">
                    Detail produk dari QR Code Scan
                  </p>
                </div>

                <div className="content">
                  <div className="card" style={{ marginBottom: "1rem", backgroundColor: "#fff" }}>
                    <div className="card-content">
                      <div className="media">
                        <div className="media-left">
                          <span className="icon is-large has-text-primary">
                            <i className="fas fa-tag fa-2x"></i>
                          </span>
                        </div>
                        <div className="media-content">
                          <p className="heading">Nama Produk</p>
                          <p className="title is-4">{product.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ marginBottom: "1rem", backgroundColor: "#fff" }}>
                    <div className="card-content">
                      <div className="media">
                        <div className="media-left">
                          <span className="icon is-large has-text-info">
                            <i className="fas fa-industry fa-2x"></i>
                          </span>
                        </div>
                        <div className="media-content">
                          <p className="heading">Merek</p>
                          <p className="title is-5">
                            <span className="tag is-info is-large">{product.merek}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ marginBottom: "1rem", backgroundColor: "#fff" }}>
                    <div className="card-content">
                      <div className="media">
                        <div className="media-left">
                          <span className="icon is-large has-text-success">
                            <i className="fas fa-barcode fa-2x"></i>
                          </span>
                        </div>
                        <div className="media-content">
                          <p className="heading">Serial Number</p>
                          <p className="title is-5">
                            <code style={{ fontSize: "1.2rem", backgroundColor: "#f5f5f5", padding: "0.5rem", borderRadius: "4px" }}>
                              {product.serialNumber}
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {product.user && (
                    <div className="card" style={{ marginBottom: "1rem", backgroundColor: "#fff" }}>
                      <div className="card-content">
                        <div className="media">
                          <div className="media-left">
                            <span className="icon is-large has-text-warning">
                              <i className="fas fa-user fa-2x"></i>
                            </span>
                          </div>
                          <div className="media-content">
                            <p className="heading">Dibuat Oleh</p>
                            <p className="title is-5">{product.user.name}</p>
                            {product.user.email && (
                              <p className="subtitle is-6 has-text-grey">{product.user.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="notification is-success is-light mt-5">
                  <p className="is-size-7">
                    <i className="fas fa-check-circle mr-2"></i>
                    Informasi produk berhasil dimuat dari QR Code
                  </p>
                </div>

                <div className="buttons is-centered mt-5">
                  <button 
                    className="button is-primary is-large" 
                    onClick={() => window.location.href = "/"}
                  >
                    <span className="icon">
                      <i className="fas fa-home"></i>
                    </span>
                    <span>Kembali ke Home</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

