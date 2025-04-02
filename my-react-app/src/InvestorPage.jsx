import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Hero } from "./components/Hero/Hero";
import { About } from "./components/About/About";
import { Experience } from "./components/Experience/Experience";
// import { Contact } from "./components/Contact/Contact";
import axios from "axios";
const InvestorPage = () => {
    const { email } = useParams(); // Get email from URL parameter
    const [profile, setProfile] = useState(null);
    {console.log(email)};
    useEffect(() => {
        // Fetch profile details for the specific email
        axios.get(`http://localhost:3001/profile/${email}`)
            .then((res) => {
                if (res.data.status === "Success") {
                    setProfile(res.data.profile);
                } else {
                    console.error("Failed to fetch profile");
                }
            })
            .catch((err) => console.error(err));

        // Fetch profile picture for the specific email
        axios.get(`http://localhost:3001/profile/photo/${email}`)
            .then((response) => {
                if (response.data.profilePic) {
                    setProfilePic(response.data.profilePic);
                }
            })
            .catch((err) => console.error("Error fetching profile picture", err));
    }, [email]); // Make sure to re-fetch when the email changes


    if (!profile) return <div>Loading...</div>;

    return (
        <div>
            {/* Pass email along with other profile data to the child components */}
            {console.log(profile.tags)};
            <Hero  email={email} name={profile.firstName} description={profile.description}/>
            <Experience email={email} experience={profile.experience} />
            <About email={email} education={profile.education} />
            {/* <Contact /> */}
        </div>
    );
};

export default InvestorPage;
