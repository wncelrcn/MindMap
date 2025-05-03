import Head from "next/head";
import styles from "@/styles/Login.module.css";
import { useState } from "react";
import { useRouter } from "next/router";

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

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Login</h1>
          <label htmlFor="email" className={styles.label}>
            Email
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
            Password
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
        </form>
      </div>
    </>
  );
}
