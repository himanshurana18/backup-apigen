import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaLaptopCode } from "react-icons/fa";
import { act } from "react";
import { set } from "mongoose";

export default function signup() {
  const { status } = useSession();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasExistingUsers, setHasExistingUsers] = useState(false);
  const router = useRouter();
  //   useEffect(() => {
  //     if (status === "authenticated") {
  //       router.push("/dashboard");
  //     }
  //   }, [status, router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (hasExistingUsers) {
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "signup",
          firstname,
          lastname,
          email,
          password,
          role: "superAdmin", // default role for the first user
        }),
      });

      const data = await response.json();

      if (response.status === 403) {
        setShowPopup(true);
        setHasExistingUsers(true);
        return;
      }

      if (!response.ok) {
        setError(data.message || "An error occurred during signup");
      }

      //create user model automatic when signup(req for database setup)
      const userModelResponse = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`, // Use the token from the signup response
        },
        body: JSON.stringify({
          modelType: "user",
          data: {
            id: data.user._id,
            firstname,
            lastname,
            email,
            password: "**********", //include password field but don't send actual password
            userRole: "superAdmin", // default role for the first user
          },
        }),
      });

      const userModelData = await userModelResponse.json();
      if (!userModelResponse.ok) {
        console.log(
          "An error occurred while creating user model",
          userModelData
        );
      } else {
        console.log("User model created successfully");
      }

      localStorage.setItem("token", data.json);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/auth/signin");
    } catch (error) {
      setHasExistingUsers(true);
      setShowPopup(true);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth_container">
      <div className="auth_decor_left"></div>
      <div className="auth_decor_circle1"></div>
      <div className="auth_decor_circle2"></div>

      {/* <div className="auth_popup_overlay"></div> */}
      {showPopup && (
        <div className="auth_popup_overlay">
          <div className="auth_popup">
            <div className="auth_popup_bar"></div>
            <div className="auth_popup_content">
              <div className="auth_popup_icon">
                <FaLaptopCode className="auth_popup_icon_inner" />
              </div>
              <h2 className="auth_popup_title">Admin Access Required</h2>
              <p className="auth_popup_desc">
                You don't have access to register. Please contact the admin for
                assistance.
              </p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="auth_popup_button"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}

      {!hasExistingUsers && (
        <div className="auth_form_wrapper">
          <div className="auth_form_header">
            <h2 className="auth_form_title">Create Account</h2>
            <p className="auth_form_subtitle">
              Already have an account?{" "}
              <Link href="/auth/signin" className="auth_form_link">
                Sign in
              </Link>{" "}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <div className="auth_error">{error}</div>}
            <div className="auth_name_fields">
              <div className="auth_input_group">
                <label htmlFor="firstname">First name</label>
                <input
                  type="text"
                  name="firstname"
                  id="firstname"
                  required
                  className="auth_input"
                  placeholder="Himanshu"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>
              <div className="auth_input_group">
                <label htmlFor="lastname">Last name</label>
                <input
                  type="text"
                  name="lastname"
                  id="lastname"
                  required
                  className="auth_input"
                  placeholder="rana"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
            </div>

            <div className="auth_input_group">
              <label htmlFor="email-address">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="auth_input"
                placeholder="himanshu180905@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth_input_group">
              <label htmlFor="password">password</label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="auth_input"
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="auth_input_group">
              <label htmlFor="Confirm-password">Confirm-password</label>
              <input
                type="confirm-password"
                name="confirm-password"
                id="confirm-password"
                required
                className="auth_input"
                placeholder="**********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`auth_submit_button ${
                isLoading || hasExistingUsers ? "auth_disabled" : ""
              }`}
              disabled={isLoading || hasExistingUsers}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
