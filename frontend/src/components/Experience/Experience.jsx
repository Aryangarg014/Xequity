import React from "react";
import styles from "./Experience.module.css";

// Experience component expects `experience` as a prop
export const Experience = ({ experience }) => {
  if (experience.length>0) {
    return (
      <section className={styles.container} id="experience">
      <h2 className={styles.title}>Experience</h2>
      <div className={styles.content}>
        <ul className={styles.aboutItems}>
          {experience.map((exp, index) => (
            <li className={styles.aboutItem} key={index}>
              <div className={styles.aboutItemText}>
                <div className={styles.companyHeading}>
                  <h3>{exp.companyName}</h3>
                </div>
                <p>{exp.role}</p>
                <br />
                <p>
                  {exp.startYear} - {exp.endYear}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
    );
  }

  
};
