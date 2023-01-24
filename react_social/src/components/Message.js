import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

//nav done //local done
export default function Message({
    senderName,
    profilePicture,
    message,
    id,
    backToBack,
    date,
    viewed,
    ppCDNLink
}) {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [isHover, setHover] = useState(false);
    const navigate = useNavigate();

    const hoverStyle = {
        cursor: isHover ? "pointer" : "default",
    };
    const fulldate = new Date(date);

    return (
        <motion.div
            variants={{
                visible: { scale: 1, opacity: 1 },
                exit: { scale: 0.8, opacity: 0 },
            }}
            initial="exit"
            animate="visible"
            exit="exit"
            layout
            className={`chatroom--message${
                senderName === currentUser.name ? "-self" : ""
            }`}
            onClick={() => navigate(`/${senderName}`)}
            style={{ marginBottom: backToBack ? "2px" : "30px" }}
        >
            {!backToBack ? (
                senderName !== currentUser.name && (
                    <img
                        src={ppCDNLink}
                        className="chatroom--prof-pic"
                        style={hoverStyle}
                        onMouseEnter={() => setHover((prev) => !prev)}
                        onMouseLeave={() => setHover((prev) => !prev)}
                    ></img>
                )
            ) : (
                <div className="chatroom--prof-pic-empty"></div>
            )}
            <div
                className={`chatroom--message-content-wrapper${
                    senderName === currentUser.name ? "-self" : ""
                }`}
            >
                <div
                    className={`chatroom--message-content${
                        senderName === currentUser.name ? "-self" : ""
                    }`}
                >
                    {message}
                </div>
                {!backToBack && (
                    <div className="chatroom--username">
                        {senderName + " • " + fulldate.toLocaleTimeString()}
                    </div>
                )}
            </div>
            {!backToBack ? (
                senderName === currentUser.name && (
                    <img
                        src={"data:image/png;base64," + profilePicture}
                        className="chatroom--prof-pic"
                        style={hoverStyle}
                        onMouseEnter={() => setHover((prev) => !prev)}
                        onMouseLeave={() => setHover((prev) => !prev)}
                    ></img>
                )
            ) : (
                <div className="chatroom--prof-pic-empty"></div>
            )}
        </motion.div>
    );
}
