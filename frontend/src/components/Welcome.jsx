import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const Welcome = () => {
  const { user } = useSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getHistory = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(`${API_BASE_URL}/products/history`);
        setHistory(response.data);
      } catch (error) {
        if (error.response) {
          setError(error.response.data.msg || "Gagal memuat history");
        } else {
          setError("Gagal memuat history");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="content">
      <div className="columns is-multiline">
        <div className="column is-12">
          <div className="card">
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  <figure className="image is-48x48">
                    <span className="icon is-large has-text-primary">
                      <i className="fas fa-user-circle fa-2x"></i>
                    </span>
                  </figure>
                </div>
                <div className="media-content">
                  <p className="title is-4">Welcome Back, {user && user.name}!</p>
                  <p className="subtitle is-6">
                    Role: <span className="tag is-primary">{user && user.role}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column is-6">
          <div className="card has-background-primary has-text-white">
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  <span className="icon is-large">
                    <i className="fas fa-boxes fa-2x"></i>
                  </span>
                </div>
                <div className="media-content">
                  <p className="title is-5">Inventory Management</p>
                  <p>Manage your products efficiently</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column is-6">
          <div className="card has-background-info has-text-white">
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  <span className="icon is-large">
                    <i className="fas fa-users fa-2x"></i>
                  </span>
                </div>
                <div className="media-content">
                  <p className="title is-5">User Management</p>
                  <p>Control user access and permissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Input Barang */}
        <div className="column is-12">
          <div className="card">
            <div className="card-header">
              <p className="card-header-title">
                <span className="icon mr-2">
                  <i className="fas fa-history"></i>
                </span>
                History Input Barang
              </p>
            </div>
            <div className="card-content">
              {error && (
                <div className="notification is-danger is-light">
                  <button className="delete" onClick={() => setError("")}></button>
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="has-text-centered py-4">
                  <span className="icon is-large">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                  </span>
                  <p className="mt-3">Memuat history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="notification is-info is-light">
                  <p>Tidak ada history input barang.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table is-striped is-hoverable is-fullwidth">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Produk</th>
                        <th>Merek</th>
                        <th>Serial Number</th>
                        <th>Dibuat Oleh</th>
                        <th>Email</th>
                        <th>Waktu Input</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{item.productName}</strong>
                          </td>
                          <td>
                            <span className="tag is-primary">{item.merek}</span>
                          </td>
                          <td>
                            <code className="is-size-7">{item.serialNumber}</code>
                          </td>
                          <td>{item.createdBy}</td>
                          <td>
                            <span className="is-size-7">{item.createdByEmail}</span>
                          </td>
                          <td>
                            <span className="is-size-7">{formatDate(item.createdAt)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {history.length > 10 && (
                    <div className="notification is-info is-light mt-4">
                      <p className="is-size-7">
                        Menampilkan 10 dari {history.length} history terbaru. 
                        <Link to="/products" className="ml-2">
                          Lihat semua produk
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
