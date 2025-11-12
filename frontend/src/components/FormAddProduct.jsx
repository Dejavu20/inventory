import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormAddProduct = () => {
  const [name, setName] = useState("");
  const [merek, setMerek] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const saveProduct = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    // Validasi client-side
    if (!name || !merek) {
      setMsg("Nama dan Merek harus diisi");
      setIsLoading(false);
      return;
    }

    if (name.trim().length < 3) {
      setMsg("Nama produk minimal 3 karakter");
      setIsLoading(false);
      return;
    }

    if (name.trim().length > 100) {
      setMsg("Nama produk maksimal 100 karakter");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/products`, {
        name: name.trim(),
        merek: merek.trim(),
      });
      navigate("/products");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal menambahkan produk");
      } else {
        setMsg("Gagal menambahkan produk");
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
              <h1 className="title">Tambah Produk Baru</h1>
              <h2 className="subtitle">Tambahkan produk baru ke inventory</h2>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <Link to="/products" className="button is-light">
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
              <form onSubmit={saveProduct}>
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
                    Nama Produk <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama produk"
                      required
                      minLength="3"
                      maxLength="100"
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-box"></i>
                    </span>
                  </div>
                  <p className="help">
                    Nama produk harus antara 3 hingga 100 karakter
                  </p>
                  {name && name.length < 3 && (
                    <p className="help has-text-danger">
                      Nama produk minimal 3 karakter (tersisa {3 - name.length} karakter)
                    </p>
                  )}
                  {name && name.length > 100 && (
                    <p className="help has-text-danger">
                      Nama produk maksimal 100 karakter (kelebihan {name.length - 100} karakter)
                    </p>
                  )}
                </div>

                <div className="field">
                  <label className="label">
                    Merek <span className="has-text-danger">*</span>
                  </label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={merek}
                      onChange={(e) => setMerek(e.target.value)}
                      placeholder="Masukkan merek produk"
                      required
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-tag"></i>
                    </span>
                  </div>
                </div>

                <div className="notification is-info is-light">
                  <p className="is-size-7">
                    <i className="fas fa-info-circle mr-2"></i>
                    Serial number akan dibuat otomatis setelah produk ditambahkan.
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
                    <Link to="/products" className="button is-light">
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

export default FormAddProduct;
