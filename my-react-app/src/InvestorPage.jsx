import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Hero } from "./components/Hero/Hero";
import { About } from "./components/About/About";
import { Experience } from "./components/Experience/Experience";
// import { Contact } from "./components/Contact/Contact";
import axios from "axios";
import styles from "./InvestorPage.module.css";

const InvestorPage = () => {
    const { email } = useParams(); // Get email from URL parameter
    const [profile, setProfile] = useState(null);
    const [profilePic, setProfilePic] = useState("");
    const [loading, setLoading] = useState(true);
    const [visibleSections, setVisibleSections] = useState({
        hero: false,
        experience: false,
        about: false
    });
    
    // Refs for each section
    const heroRef = useRef(null);
    const experienceRef = useRef(null);
    const aboutRef = useRef(null);
    
    useEffect(() => {
        // Fetch profile details for the specific email
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch profile data
                const profileRes = await axios.get(`http://localhost:3001/profile/${email}`);
                
                if (profileRes.data.status === "Success") {
                    setProfile(profileRes.data.profile);
                    
                    // Fetch profile picture
                    const photoRes = await axios.get(`http://localhost:3001/profile/photo/${email}`);
                    if (photoRes.data.profilePic) {
                        setProfilePic(photoRes.data.profilePic);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [email]);
    
    // Scroll animation handler
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight * 0.8;
            
            // Check each section's position and update visibility state
            if (heroRef.current && scrollPosition > heroRef.current.offsetTop) {
                setVisibleSections(prev => ({ ...prev, hero: true }));
            }
            
            if (experienceRef.current && scrollPosition > experienceRef.current.offsetTop) {
                setVisibleSections(prev => ({ ...prev, experience: true }));
            }
            
            if (aboutRef.current && scrollPosition > aboutRef.current.offsetTop) {
                setVisibleSections(prev => ({ ...prev, about: true }));
            }
        };
        
        // Set initial visibility on load
        setTimeout(handleScroll, 300);
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        
        // Clean up
        return () => window.removeEventListener('scroll', handleScroll);
    }, [profile]);
    
    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (loading) return <div className={styles.loading}>Loading profile</div>;
    if (!profile) return <div className={styles.loading}>Profile not found</div>;

    return (
        <div className={styles.investorPage}>
            <div className={styles.topBackground}></div>
            <div className={styles.gradientOverlay}></div>
            
            <div className={styles.pageWrapper}>
                <div 
                    ref={heroRef} 
                    className={`${styles.section} ${visibleSections.hero ? styles.visible : ''}`}
                >
                    <Hero 
                        email={email} 
                        name={profile.firstName} 
                        description={profile.description}
                    />
                </div>
                
                {profile.experience && profile.experience.length > 0 && (
                    <div 
                        ref={experienceRef} 
                        className={`${styles.section} ${visibleSections.experience ? styles.visible : ''}`}
                    >
                        <Experience email={email} experience={profile.experience} />
                    </div>
                )}
                
                {profile.education && profile.education.length > 0 && (
                    <div 
                        ref={aboutRef} 
                        className={`${styles.section} ${visibleSections.about ? styles.visible : ''}`}
                    >
                        <About email={email} education={profile.education} />
                    </div>
                )}
            </div>
            
            <div className={styles.scrollIndicator} onClick={scrollToTop}></div>
        </div>
    );
};

export default InvestorPage;
