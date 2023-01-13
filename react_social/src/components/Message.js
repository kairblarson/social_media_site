import { useState, useEffect } from "react";

export default function Message({ senderName, profilePicture, message, id }) {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [isHover, setHover] = useState(false);

    const hoverStyle = {
        cursor: isHover ? "pointer" : "default",
    };

    return (
        <div
            className={`chatroom--message${
                senderName === currentUser.name ? "-self" : ""
            }`}
            onClick={() =>
                (window.location = `http://localhost:3000/${senderName}`)
            }
        >
            {senderName !== currentUser.name && (
                <img
                    src={"data:image/png;base64," + profilePicture}
                    className="chatroom--prof-pic"
                    style={hoverStyle}
                    onMouseEnter={() => setHover((prev) => !prev)}
                    onMouseLeave={() => setHover((prev) => !prev)}
                ></img>
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
                <div className="chatroom--username">{senderName}</div>
            </div>
            {senderName === currentUser.name && (
                <img
                    src={"data:image/png;base64," + profilePicture}
                    className="chatroom--prof-pic"
                    style={hoverStyle}
                    onMouseEnter={() => setHover((prev) => !prev)}
                    onMouseLeave={() => setHover((prev) => !prev)}
                ></img>
            )}
        </div>
    );
}
