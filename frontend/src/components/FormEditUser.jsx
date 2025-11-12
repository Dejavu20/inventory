import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormEditUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("User");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getUserById = async () => {
      try {
        setIsFetching(true);
        setMsg("");
        const response = await axios.get(`${API_BASE_URL}/users/${id}`);
        setName(response.data.name || "");
        setEmail(response.data.email || "");
        setRole(response.data.role || "User");
      } catch (error) {
        if (error.response) {
          setMsg(error.response.data.msg || "Gagal memuat data user");
        } else {
          setMsg("Gagal memuat data user");
        }
      } finally {
        setIsFetching(false);
      }
    };
    getUserById();
  }, [id]);

  const updateUser = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    // Validation
    if (!name || !email || !role) {
      setMsg("Nama, Email, dan Role harus diisi");
      setIsLoading(false);
      return;
    }

    // Only validate password if it's provided
    if (password || confPassword) {
      if (password !== confPassword) {
        setMsg("Password dan Konfirmasi Password tidak cocok");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setMsg("Password minimal 6 karakter");
        setIsLoading(false);
        return;
      }
    }

    try {
      await axios.patch(`${API_BASE_URL}/users/${id}`, {
        name: name,
        email: email,
        password: password || "",
        confPassword: confPassword || "",
        role: role,
      });
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal mengupdate user");
      } else {
        setMsg("Gagal mengupdate user");
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (isFetching) {
    return (
      <div className="container">
        <div className="has-text-centered py-6">
          <span className="icon is-large">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </span>
          <p className="mt-3">Memuat data user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title">Edit User</h1>
              <h2 className="subtitle">Update informasi user</h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link to="/users" className="button is-light">
              <span className="icon">
                <i className="fas fa-arrow-left"></i>
              </span>
              <span>Kembali</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="columns is-centered">
        <div className="column is-half">
          <div className="card">
            <div className="card-content">
              <form onSubmit={updateUser}>
                {msg && (
                  <div className="notification is-danger is-light">
                    <button
                      className="delete"
                      onClick={() => setMsg("")}
                    ></button>
                    {msg}
                  </div>
                )}

                <div className="field">
                  <label className="label">
                    Nama <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama"
                      required
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-user"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label">
                    Email <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email"
                      required
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Password</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak ingin mengubah password"
                      minLength="6"
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-lock"></i>
                    </span>
                  </div>
                  <p className="help">
                    Kosongkan jika tidak ingin mengubah password
                  </p>
                </div>

                <div className="field">
                  <label className="label">Konfirmasi Password</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={confPassword}
                      onChange={(e) => setConfPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      minLength="6"
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-lock"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label">
                    Role <span className="has-text-danger">*</span>
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <p className="help">
                    Admin memiliki akses penuh untuk mengelola user
                  </p>
                </div>

                <div className="field is-grouped">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="icon">
                            <i className="fas fa-spinner fa-spin"></i>
                          </span>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <span className="icon">
                            <i className="fas fa-save"></i>
                          </span>
                          <span>Update</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="control">
                    <Link to="/users" className="button is-light">
                      Batal
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormEditUser;
