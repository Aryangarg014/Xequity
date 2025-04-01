import React from "react";

import styles from "./Contact.module.css";
import {getImageUrl} from "../../utils";
import linkedin from "../../assets/linkedinIcon.png";

import github from "../../assets/githubIcon.png";

import maill from "../../assets/emailIcon.png";


export const Contact = () => {
  return (
         <section className={styles.container} >
       <div className={styles.text}>
         <h2>Contact</h2>
         <p>Feel free to reach out!</p>
       </div>
       <ul className={styles.links}>
         <li className={styles.link}>
           <img src={maill} alt="Email icon" />
           <a href="mailto:myemail@email.com">work.nikhil@email.com</a>
         </li>
         <li className={styles.link}>
           <img
            src={linkedin}
            alt="LinkedIn icon"
          />
          <a href="https://www.linkedin.com/myname">linkedin.com/nikhilKamath</a>
        </li>
        <li className={styles.link}>
          <img src={github} alt="Github icon" />
          <a href="https://www.github.com/myname">github.com/nikhilhere</a>
        </li>
      </ul>
    </section>
  );
};
