import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Register.module.css";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        birthday,
        gender,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Redirect to login page after successful registration
      router.push("/login");
    } else {
      setError(data.message || "Registration failed");
    }
  };

  return (
    <>
      <Head>
        <title>Register</title>
        <meta name="description" content="Create a new account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Register</h1>

          {error && <div className={styles.error}>{error}</div>}

          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input
            type="text"
            id="name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <label htmlFor="birthday" className={styles.label}>
            Birthday
          </label>
          <input
            type="date"
            id="birthday"
            className={styles.input}
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
          />

          <label htmlFor="gender" className={styles.label}>
            Gender
          </label>
          <select
            id="gender"
            className={styles.input}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

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

          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>
      </div>
    </>
  );
}
