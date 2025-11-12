import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const Userlist = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal memuat data user");
      } else {
        setError("Gagal memuat data user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      setDeleteConfirm(null);
      getUsers();
    } catch (error) {
      if (error.response) {
        setError(error.response.data.msg || "Gagal menghapus user");
      } else {
        setError("Gagal menghapus user");
      }
    }
  };

  const confirmDelete = (userId, userName) => {
    setDeleteConfirm({ userId, userName });
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title">Manajemen User</h1>
              <h2 className="subtitle">Daftar semua user dalam sistem</h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link to="/users/add" className="button is-primary">
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Tambah User</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="notification is-danger is-light">
          <button className="delete" onClick={() => setError("")}></button>
          {error}
        </div>
      )}

      {deleteConfirm && (
        <div className="modal is-active">
          <div className="modal-background" onClick={cancelDelete}></div>
          <div className="modal-content">
            <div className="box">
              <p className="title is-5">Konfirmasi Hapus</p>
              <p>
                Apakah Anda yakin ingin menghapus user <strong>{deleteConfirm.userName}</strong>?
              </p>
              <p className="has-text-danger is-size-7 mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="buttons mt-4">
                <button
                  className="button is-danger"
                  onClick={() => deleteUser(deleteConfirm.userId)}
                >
                  Hapus
                </button>
                <button className="button" onClick={cancelDelete}>
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="has-text-centered py-6">
          <span className="icon is-large">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </span>
          <p className="mt-3">Memuat data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="notification is-info is-light">
          <p>Tidak ada user yang ditemukan.</p>
        </div>
      ) : (
        <div className="box">
          <div className="table-container">
            <table className="table is-striped is-fullwidth is-hoverable">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="has-text-centered">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.uuid}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email || "-"}</td>
                    <td>
                      <span
                        className={`tag ${
                          user.role && user.role.toLowerCase() === "admin"
                            ? "is-danger"
                            : "is-info"
                        }`}
                      >
                        {user.role || "User"}
                      </span>
                    </td>
                    <td>
                      <div className="buttons are-small">
                        <Link
                          to={`/users/edit/${user.uuid}`}
                          className="button is-info is-light"
                          title="Edit User"
                        >
                          <span className="icon">
                            <i className="fas fa-edit"></i>
                          </span>
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => confirmDelete(user.uuid, user.name)}
                          className="button is-danger is-light"
                          title="Hapus User"
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
    </div>
  );
};

export default Userlist;
