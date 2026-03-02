"use client";

import { useAuthStore } from "@/store/auth";
import React, { useState, useEffect } from "react";
import { CheckCircle, Lock, Mail, XCircle, EyeClosed, Eye } from "lucide-react";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const Login: React.FC = () => {
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [animationLoaded, setAnimationLoaded] = useState<boolean>(false);

  // Fallback timeout in case onLoad doesn't trigger
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!animationLoaded) {
        setAnimationLoaded(true);
      }
    }, 200);
    return () => clearTimeout(fallbackTimer);
  }, [animationLoaded]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Validation check
  const validationIcon = (valid: boolean, value: string) => {
    if (!value) return null;
    if (valid)
      return (
        <CheckCircle
          className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 transition-all duration-300 animate-[checkmark_0.5s_ease-out]"
          size={20}
          aria-label="valid"
        />
      );
    return (
      <XCircle
        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 transition-all duration-300 animate-[shake_0.5s_ease-out]"
        size={20}
        aria-label="invalid"
      />
    );
  };

  const btnBase =
    "relative w-full py-2.5 rounded-lg text-white font-semibold text-base bg-gradient-to-br from-green-600 to-green-500 shadow transition-all overflow-hidden flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 hover:opacity-90 duration-500";
  const btnIcon =
    "pointer-events-none flex items-center justify-center mr-2 flex-shrink-0 opacity-80";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-5 overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative z-10 w-full max-w-[480px] bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_20px_60px_rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.1)] animate-slideUp">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl">
              <DotLottieReact
                src="/tree-animation.lottie"
                loop
                autoplay
                onLoad={() => setAnimationLoaded(true)}
                onError={() => setAnimationLoaded(true)}
                style={{
                  width: "250px",
                  height: "250px",
                  opacity: animationLoaded ? 0.9 : 0,
                  transition: "opacity 0.3s ease-out",
                }}
              />
            </div>
          </div>
          <div>
            <h1
              className={`text-green-600 text-2xl md:text-[28px] font-bold mb-2 transition-all duration-500 ${
                animationLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Welcome Back!
            </h1>
            <p
              className={`text-gray-600 text-base mb-2 transition-all duration-500 delay-100 ${
                animationLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Sign in to continue to your account
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off" className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div
            className={`mb-5 form-group transition-all duration-500 delay-200 ${
              animationLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all"
                size={20}
                strokeWidth={1.8}
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-10 py-2.5 rounded-lg border-2 border-gray-200 bg-gray-50 text-sm placeholder:text-sm transition-all focus:border-green-600 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderColor: email
                    ? isEmailValid
                      ? "#43A047"
                      : "#f44336"
                    : "#e0e0e0",
                }}
                required
                disabled={loading}
              />
              {validationIcon(isEmailValid, email)}
            </div>
          </div>

          {/* Password */}
          <div
            className={`mb-5 form-group transition-all duration-500 delay-300 ${
              animationLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all"
                size={20}
                strokeWidth={1.8}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-12 pr-10 py-2.5 rounded-lg border-2 border-gray-200 bg-gray-50 text-sm placeholder:text-sm transition-all focus:border-green-600 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  borderColor: password
                    ? isPasswordValid
                      ? "#43A047"
                      : "#f44336"
                    : "#e0e0e0",
                }}
                required
                disabled={loading}
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500 hover:opacity-80"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </button>
              )}
              {validationIcon(isPasswordValid, password)}
            </div>
          </div>

          {/* Forgot Password */}
          {/* <div className="text-right mb-6">
            <a
              href="#"
              className={`text-sm text-green-600 hover:underline ${
                animationLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Forgot password?
            </a>
          </div> */}

          {/* Login button */}
          <div
            className={`flex flex-col gap-3 mt-2 mb-1 transition-all duration-500 delay-400 ${
              animationLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <button
              type="submit"
              className={btnBase}
              disabled={loading || !isEmailValid || !isPasswordValid}
            >
              {loading && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-white animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </span>
              )}
              <span className="transition-opacity duration-300">
                {loading ? "Signing In..." : "Sign In"}
              </span>
            </button>

            {/* Social Login Buttons */}
            <button
              type="button"
              className={`${btnBase} !bg-[#DB4437] !from-[#DB4437] !to-[#DB4437]`}
              aria-label="Login with Google"
              disabled={loading}
            >
              <span className={btnIcon}>
                <RiGoogleFill size={18} aria-hidden="true" />
              </span>
              Login with Google
            </button>

            <button
              type="button"
              className={`${btnBase} !bg-[#24292F] !from-[#24292F] !to-[#24292F]`}
              aria-label="Login with GitHub"
              disabled={loading}
            >
              <span className={btnIcon}>
                <RiGithubFill size={18} aria-hidden="true" />
              </span>
              Login with GitHub
            </button>
          </div>

          <p
            className={`text-center mt-5 text-gray-600 text-sm transition-all duration-500 delay-500 ${
              animationLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-green-600 font-medium hover:text-green-700 transition-colors"
            >
              Sign up here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
