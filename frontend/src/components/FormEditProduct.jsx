import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const FormEditProduct = () => {
  const [name, setName] = useState("");
  const [merek, setMerek] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const getProductById = async () => {
      try {
        setIsFetching(true);
        setMsg("");
        const response = await axios.get(
          `${API_BASE_URL}/products/${id}`
        );
        setName(response.data.name || "");
        setMerek(response.data.merek || "");
        setSerialNumber(response.data.serialNumber || "");
      } catch (error) {
        if (error.response) {
          setMsg(error.response.data.msg || "Gagal memuat data produk");
        } else {
          setMsg("Gagal memuat data produk");
        }
      } finally {
        setIsFetching(false);
      }
    };
    getProductById();
  }, [id]);

  const updateProduct = async (e) => {
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
      await axios.patch(`${API_BASE_URL}/products/${id}`, {
        name: name.trim(),
        merek: merek.trim(),
      });
      navigate("/products");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Gagal mengupdate produk");
      } else {
        setMsg("Gagal mengupdate produk");
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
          <p className="mt-3">Memuat data produk...</p>
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
              <h1 className="title">Edit Produk</h1>
              <h2 className="subtitle">Update informasi produk</h2>
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
              <form onSubmit={updateProduct}>
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

                <div className="field">
                  <label className="label">Serial Number</label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      className="input"
                      value={serialNumber || ""}
                      placeholder="Serial Number (read-only)"
                      disabled
                      readOnly
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-barcode"></i>
                    </span>
                  </div>
                  <p className="help">Serial number dibuat otomatis dan tidak dapat diubah</p>
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

export default FormEditProduct;
