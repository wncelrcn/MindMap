import styles from "@/styles/SupportFooter.module.css";
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function SupportFooter() {
  return (
    <footer className={`${poppins.className} ${styles.footer}`}>
      <div className={styles.left}>
        <h2 className={styles.heading}>
          Need Immediate Support?
          <br />
          You’re Not Alone.
        </h2>
        <p className={styles.subheading}>24/7 Hotline</p>
      </div>

      <div className={styles.hotlines}>
        <div className={styles.org}>
          <Image
            src="/assets/hopeline.png"
            alt="Hopeline PH"
            width={50}
            height={50}
          />
          <p className={styles.orgName}>Hopeline PH</p>
          <p>(02) 8804-4673</p>
          <p>0917-558-4673</p>
          <p>0918-873-4673</p>
        </div>

        <div className={styles.org}>
          <Image src="/assets/doh.png" alt="DOH-NCMH" width={50} height={50} />
          <p className={styles.orgName}>
            National Center for Mental
            <br />
            Health (DOH-NCMH)
          </p>
          <p>0919-057-1553</p>
          <p>0966-351-4518</p>
        </div>

        <div className={styles.org}>
          <Image
            src="/assets/intouch.png"
            alt="In-Touch"
            width={50}
            height={50}
          />
          <p className={styles.orgName}>In-Touch</p>
          <p>(02) 8893 7603</p>
          <p>0917-800-1123</p>
          <p>0919-056-0709</p>
        </div>
      </div>
    </footer>
  );
}
