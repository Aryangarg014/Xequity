import React from "react";
import styles from "./About.module.css";

export const About = ({ email, education }) => {
    return (
        <section className={styles.container} id="about">
            <h2 className={styles.title}>ABOUT</h2>
          
            <div className={styles.content}>
                <div className={styles.educationcard}>
                    <h2>Education</h2>
                    {education && education.length > 0 ? (
                        education.map((edu, index) => (
                            <div key={index} className={styles.infoo}>
                                <h3>{edu.schoolName}</h3>
                                <p>{edu.courseName}</p>
                                <span>{edu.startYear} - {edu.endYear}</span>
                            </div>
                        ))
                    ) : (
                        <p>No education data available.</p>
                    )}
                </div>
            </div>
        </section>
    );
};
