import styles from "@/styles/Footer.module.css";
import Image from "next/image";
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

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.leftSection}>
        <div className={styles.logoArea}>
          <Image
            alt="MindMap Logo"
            width={60}
            height={60}
            src={"/assets/logo.png"}
            className={styles.logo}
          />
        </div>
        <div>
          <h2 className={`${styles.brand} ${raleway.className}`}>MindMap</h2>
        </div>
        <div className={`${poppins.className} ${styles.contact}`}>
          <div>
            <p className={styles.label}>Email</p>
            <p className={styles.info}>MindMap@gmail.com</p>
          </div>
          <div>
            <p className={styles.label}>Phone Number</p>
            <p className={styles.info}>(049) 1122-234</p>
          </div>
        </div>
      </div>
      <div className={styles.rightSection}>
        <p className={`${styles.tagline} ${raleway.className}`}>
          The Journal Where Every Thought Maps Its Purpose
        </p>
      </div>
    </footer>
  );
}
