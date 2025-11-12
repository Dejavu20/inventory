import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormAddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("User");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const saveUser = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    // Validation
    if (!name || !email || !password || !confPassword || !role) {
      setMsg("Semua field harus diisi");
      setIsLoading(false);
      return;
    }

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

    try {
      await axios.post(`${API_BASE_URL}/users`, {
        name: name,
        email: email,
        password: password,
        confPassword: confPassword,
        role: role,
      });
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan user");
      } else {
        setMsg("Gagal menambahkan user");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h1 className="title">Tambah User Baru</h1>
              <h2 className="subtitle">Buat user baru untuk sistem</h2>
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
              <form onSubmit={saveUser}>
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
                  <label className="label">
                    Password <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      minLength="6"
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-lock"></i>
                    </span>
                  </div>
                  <p className="help">Password minimal 6 karakter</p>
                </div>

                <div className="field">
                  <label className="label">
                    Konfirmasi Password <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      className="input"
                      value={confPassword}
                      onChange={(e) => setConfPassword(e.target.value)}
                      placeholder="Ulangi password"
                      required
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
                          <span>Simpan</span>
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

export default FormAddUser;
