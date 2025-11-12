import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import { QRCodeSVG } from "qrcode.react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data produk");
      } else {
        setError("Gagal memuat data produk");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
      getProducts();
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus produk");
      } else {
        setError("Gagal menghapus produk");
      }
    }
  };

  const showQRCode = async (product) => {
    try {
      setIsLoadingQR(true);
      setSelectedProduct(product);
      
      // Fetch QR code from backend (for download option)
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${product.uuid}/qrcode`);
        setQrCodeData(response.data);
      } catch (error) {
        // If backend QR code fails, we can still show QR code using frontend
        // Set basic product data
        setQrCodeData({
          product: {
            uuid: product.uuid,
            name: product.name,
            merek: product.merek,
            serialNumber: product.serialNumber
          }
        });
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat QR code");
      } else {
        setError("Gagal memuat QR code");
      }
    } finally {
      setIsLoadingQR(false);
    }
  };

  const closeQRCode = () => {
    setSelectedProduct(null);
    setQrCodeData(null);
  };

  const downloadCSV = async () => {
    try {
      setError("");
      const response = await axios.get(`${API_BASE_URL}/products/export/csv`, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv'
        }
      });
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal download CSV");
      } else {
        setError("Gagal download CSV");
      }
    }
  };

  return (
    <div className="container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title">Manajemen Produk</h1>
              <h2 className="subtitle">Daftar semua produk dalam sistem</h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="buttons">
              <button 
                onClick={downloadCSV} 
                className="button is-success"
                title="Download CSV"
              >
                <span className="icon">
                  <i className="fas fa-file-csv"></i>
                </span>
                <span>Download CSV</span>
              </button>
              <Link to="/products/add" className="button is-primary">
                <span className="icon">
                  <i className="fas fa-plus"></i>
                </span>
                <span>Tambah Produk</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="notification is-danger is-light">
          <button className="delete" onClick={() => setError("")}></button>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="has-text-centered py-6">
          <span className="icon is-large">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </span>
          <p className="mt-3">Memuat data...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="notification is-info is-light">
          <p>Tidak ada produk yang ditemukan.</p>
        </div>
      ) : (
        <div className="box">
          <div className="table-container">
            <table className="table is-striped is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Produk</th>
                  <th>Merek</th>
                  <th>Serial Number</th>
                  <th>Dibuat Oleh</th>
                  <th>Waktu Input</th>
                  <th className="has-text-centered">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.uuid}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>
                      <span className="tag is-primary">{product.merek}</span>
                    </td>
                    <td>
                      <code className="has-text-info">{product.serialNumber || "-"}</code>
                    </td>
                    <td>{product.user?.name || "-"}</td>
                    <td>
                      <span className="is-size-7">
                        {product.createdAt 
                          ? new Date(product.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="buttons are-small">
                        <button
                          onClick={() => showQRCode(product)}
                          className="button is-success is-light"
                          title="Lihat QR Code"
                        >
                          <span className="icon">
                            <i className="fas fa-qrcode"></i>
                          </span>
                          <span>QR Code</span>
                        </button>
                        <Link
                          to={`/products/edit/${product.uuid}`}
                          className="button is-info is-light"
                          title="Edit Produk"
                        >
                          <span className="icon">
                            <i className="fas fa-edit"></i>
                          </span>
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.uuid)}
                          className="button is-danger is-light"
                          title="Hapus Produk"
                        >
                          <span className="icon">
                            <i className="fas fa-trash"></i>
                          </span>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedProduct && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeQRCode}></div>
          <div className="modal-content">
            <div className="box">
              <div className="has-text-centered">
                <h2 className="title is-4">QR Code Produk</h2>
                <p className="subtitle is-6">
                  <strong>{selectedProduct.name}</strong> - {selectedProduct.merek}
                </p>
                <p className="is-size-7 has-text-grey mb-4">
                  Serial: {selectedProduct.serialNumber}
                </p>
                
                {isLoadingQR ? (
                  <div className="py-6">
                    <span className="icon is-large">
                      <i className="fas fa-spinner fa-spin fa-2x"></i>
                    </span>
                    <p className="mt-3">Memuat QR Code...</p>
                  </div>
                ) : selectedProduct ? (
                  <div className="py-4">
                    <div className="has-background-white p-4" style={{ display: "inline-block", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                      <QRCodeSVG
                        value={qrCodeData?.qrUrl || `${window.location.origin}/products/detail/${selectedProduct.uuid}`}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="is-size-7 has-text-grey mt-4">
                      <i className="fas fa-info-circle mr-2"></i>
                      Scan QR code untuk melihat informasi produk di browser
                    </p>
                    <div className="notification is-success is-light mt-4">
                      <p className="is-size-7">
                        <strong>URL QR Code:</strong><br/>
                        <code className="is-size-7">
                          {qrCodeData?.qrUrl || `${window.location.origin}/products/detail/${selectedProduct.uuid}`}
                        </code>
                      </p>
                    </div>
                    <div className="notification is-info is-light mt-3">
                      <p className="is-size-7">
                        <strong>Informasi Produk:</strong><br/>
                        Nama: {selectedProduct.name}<br/>
                        Merek: {selectedProduct.merek}<br/>
                        Serial: {selectedProduct.serialNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="has-text-danger">Gagal memuat QR Code</p>
                )}
              </div>
              
              <div className="buttons is-centered mt-5">
                <button className="button is-light" onClick={closeQRCode}>
                  Tutup
                </button>
                {qrCodeData && qrCodeData.qrCode && (
                  <a
                    href={qrCodeData.qrCode}
                    download={`QRCode-${selectedProduct.serialNumber || selectedProduct.uuid}.png`}
                    className="button is-primary"
                  >
                    <span className="icon">
                      <i className="fas fa-download"></i>
                    </span>
                    <span>Download QR Code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={closeQRCode}
          ></button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
