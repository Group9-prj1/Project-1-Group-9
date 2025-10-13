import { FileText, Menu, User, Sparkles, LogOut } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import "../../styles/Header.css";

const handleLogin = () => {
  window.location.href = `/login`;
};

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE;
    fetch(`${base}/user/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    const base = import.meta.env.VITE_API_BASE;
    await fetch(`${base}/user/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.reload();
  };

  return (
    <header className="app-header">
      <div className="header-glow"></div>
      <div className="header-inner">
        <div className="header-bar">
          <div className="logo-container" onClick={() => (window.location.href = "/")}>
            <div className="logo">
              <div className="logo-badge">
                <FileText className="icon-6 text-white" />
                <div className="logo-shine"></div>
              </div>
              <div className="logo-text-wrapper">
                <span className="logo-text">Summarizer</span>
                <Sparkles className="icon-4 sparkle-icon" />
              </div>
            </div>
          </div>

          <div className="nav-right">
            {user ? (
              <div className="user-profile-wrapper" ref={dropdownRef}>
                <div
                  className="user-profile"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-profile-inner">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="avatar"
                        className="user-avatar"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        <User className="icon-5" />
                      </div>
                    )}
                    <div className="user-info">
                      <span className="user-greeting">Xin chào,</span>
                      <span className="user-name">
                        {user.full_name || user.email}
                      </span>
                    </div>
                  </div>
                  <div className="profile-glow"></div>
                </div>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut className="icon-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLogin} className="account-btn">
                <div className="btn-bg"></div>
                <User className="icon-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}

            <button className="menu-btn">
              <Menu className="icon-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
