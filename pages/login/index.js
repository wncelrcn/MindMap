import Head from "next/head";
import styles from "@/styles/Login.module.css";
import { useState } from "react";
import { useRouter } from "next/router";
import { Raleway } from "next/font/google";
import { Poppins } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
    } else {
      alert("Login successful!");
      router.push("/dashboard");
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to your account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${styles.container} ${raleway.variable} ${poppins.variable}`}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.header}>
            <img src="/assets/logo.png" alt="Logo" className={styles.logo} />
            <p className={styles.title}>MindMap</p>
          </div>
          <p className={styles.subtitle}>
            The Journal Where Every Thought Maps Its Purpose
          </p>

          <label htmlFor="email" className={styles.label}>
            EMAIL
          </label>
          <input
            type="email"
            id="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className={styles.label}>
            PASSWORD
          </label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles.button}>
            Login
          </button>

          <p className={styles.registerText}>
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className={styles.registerLink}
            >
              Register here.
            </span>
          </p>
        </form>
      </div>
    </>
  );
}
