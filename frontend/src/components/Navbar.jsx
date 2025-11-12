import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../logo.png";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Baris 10: Variabel 'user' diambil. Sekarang akan digunakan di bagian return.
  const { user } = useSelector((state) => state.auth); 

  const logout = () => {
    dispatch(LogOut());
    dispatch(reset());
    navigate("/");
  };

  return (
    <div>
      <nav
        className="navbar is-fixed-top has-shadow has-background-white"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <NavLink to="/dashboard" className="navbar-item">
            <span className="icon is-medium has-text-primary mr-2">
              <i className="fas fa-boxes fa-lg"></i>
            </span>
            <span className="has-text-weight-bold">Inventory System</span>
          </NavLink>

          <a
            href="!#"
            role="button"
            className="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-end">
            {user && user.name && (
              <div className="navbar-item">
                <div className="media">
                  <div className="media-left">
                    <figure className="image is-32x32">
                      <span className="icon is-large has-text-info">
                        <i className="fas fa-user-circle fa-lg"></i>
                      </span>
                    </figure>
                  </div>
                  <div className="media-content">
                    <p className="has-text-weight-semibold">{user.name}</p>
                    <p className="has-text-grey is-size-7">{user.role}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="navbar-item">
              <div className="buttons">
                <button onClick={logout} className="button is-danger is-light">
                  <span className="icon">
                    <i className="fas fa-sign-out-alt"></i>
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;