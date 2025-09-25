import Link from "next/link";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export default function signin() {
  const { status } = useSession();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("an error occur during signin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="decor-left"></div>
      <div className="decor-circle-purple"></div>
      <div className="decor-circle-indigo"></div>

      <div className="signin-form-wrapper">
        <div className="signin-heading">
          <h2>Welcome back</h2>
          <p>
            Don't have an account?{" "}
            <Link href="/auth/signup" className="signup-link">
              Create account
            </Link>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="signin-error">{error}</div>}
          <div className="form-group-auth">
            <label htmlFor="email">Email</label>
            <input
              ref={emailRef}
              type="text"
              name="email"
              id="email"
              autoComplete="username"
              required
              className="form-input-auth"
              placeholder="himanshu180905@gmail.com"
            />
          </div>

          <div className="password-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <input
              ref={passwordRef}
              type="Password"
              name="Password"
              id="Password"
              autoComplete="current-password"
              required
              className="form-input-auth"
              placeholder="**********"
            />
          </div>

          <button type="submit" disabled={loading} className="signin-button">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
