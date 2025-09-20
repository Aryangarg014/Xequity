import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./MessagePage.module.css";

import investorImage from "./assets/Investor.png";
import productImage from "./assets/Product.gif";

const MessagePage = () => {
  const { user1, user2 } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userProfiles, setUserProfiles] = useState({});
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3001/messages/${user1}/${user2}`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [user1, user2]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        const users = [user1, user2];
        const promises = users.map(email =>
          fetch(`http://localhost:3001/profile/photo/${email}`)
            .then(res => res.json())
            .then(data => ({
              email,
              profilePic: data.profilePic || null,
              name: data.name || email,
              type: data.type || "investor", // assume investor if not provided
            }))
        );

        const results = await Promise.all(promises);
        const profiles = {};
        results.forEach(({ email, profilePic, name, type }) => {
          profiles[email] = { profilePic, name, type };
        });
        setUserProfiles(profiles);
      } catch (err) {
        console.error("Error fetching user profiles:", err);
      }
    };

    fetchUserProfiles();
  }, [user1, user2]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch("http://localhost:3001/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user1, receiverId: user2, text: newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Failed to send message: " + errorData.error);
      }

      const updatedMessages = await response.json();
      setMessages(updatedMessages);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message failed: " + error.message);
    }
  };

  const getProfileImage = (email) => {
    const profile = userProfiles[email];
    if (!profile) return investorImage; // fallback default

    if (profile.profilePic) return profile.profilePic;
    return profile.type === "product" ? productImage : investorImage;
  };

  return (
    <div className={styles.body}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>← Back</button>

      <div className={styles.chatContainer} ref={chatContainerRef}>
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isSenderUser1 = msg.senderId === user1;
            const profile = userProfiles[msg.senderId];
            const profilePic = getProfileImage(msg.senderId);
            const name = profile?.name || msg.senderId;

            return (
              <div
                key={msg._id}
                className={isSenderUser1 ? styles.rightMessage : styles.leftMessage}
              >
                {!isSenderUser1 && (
                  <div className={styles.profileBlock}>
                    <img
                      src={profilePic}
                      alt="User"
                      className={styles.profilePic}
                      onClick={() => navigate(`/${profile?.type === "product" ? "ProductPage" : "InvestorPage"}/${msg.senderId}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <div className={styles.senderName}>{name}</div>
                  </div>
                )}

                <div className={styles.messageBubble}>{msg.text}</div>

                {isSenderUser1 && (
                  <div className={styles.profileBlock}>
                    <img
                      src={profilePic}
                      alt="You"
                      className={styles.profilePic}
                      onClick={() => navigate(`/${profile?.type === "product" ? "ProductPage" : "InvestorPage"}/${msg.senderId}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <div className={styles.senderName}>{name}</div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.noMessages}>No messages yet. Start the conversation!</div>
        )}
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.messageInput}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button className={styles.sendButton} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessagePage;
