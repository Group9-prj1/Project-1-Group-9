import { Github, Chrome, Sparkles, Star, Zap } from "lucide-react";
import ErrorPanel from "../components/home/ErrorPanel";
import { useLocation } from "react-router-dom";
import "../styles/login.css"
import { useEffect, useState } from "react";

const GoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE}/auth/google/login`
}

const GitHubLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE}/auth/github/login`
}

export default function LoginPage() {

  const { search } = useLocation();
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const error = params.get("error");

    if (error) {
      switch (error) {
        case "failed":
          setErrorMsg("Đăng nhập thất bại. Vui lòng thử lại!");
          break;
        case "oauth_failed":
          setErrorMsg("Lỗi xác thực OAuth. Vui lòng đăng nhập lại.");
          break;
        default:
          setErrorMsg("Đăng nhập thất bại. Vui lòng thử lại sau.");
      }
      setErrorOpen(true);
    }
  }, [search]);

  return (
    <div className="login-page">
      <div className="animated-background">
        <div className="blob-container">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
      </div>

      <div className="grid-pattern" />
      
      <div className="particles-container">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="stars-container">
        {[...Array(15)].map((_, i) => (
          <Star
            key={i}
            className="floating-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${12 + Math.random() * 8}px`
            }}
          />
        ))}
      </div>

      {/* Thêm mới: Lightning container */}
      <div className="lightning-container">
        {[...Array(3)].map((_, i) => (
          <Zap
            key={i}
            className="floating-lightning"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + Math.random() * 20}%`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      <div className="login-card-wrapper">
        <div className="card-glow" />
        
        <div className="login-card">
          <div className="login-header">
            <div className="icon-wrapper">
              <Sparkles className="header-icon" />
            </div>
            <h1 className="login-title">Chào Mừng</h1>
            <p className="login-subtitle">
              Chọn phương thức đăng nhập của bạn
            </p>
          </div>

          <div className="login-buttons">
            <button onClick={GoogleLogin} className="login-btn google-btn">
              <div className="btn-shine" />
              <div className="btn-content">
                <Chrome className="btn-icon" />
                <span>Tiếp tục với Google</span>
              </div>
            </button>

            <button onClick={GitHubLogin} className="login-btn github-btn">
              <div className="btn-shine" />
              <div className="btn-content">
                <Github className="btn-icon" />
                <span>Tiếp tục với GitHub</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <ErrorPanel
        open={errorOpen}
        title="Đăng nhập thất bại"
        message={errorMsg}
        onClose={() => setErrorOpen(false)}
      />
    </div>
  );
}