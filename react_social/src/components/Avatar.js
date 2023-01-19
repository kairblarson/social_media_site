import { useState, useEffect } from "react";

export default function Avatar({
    conversationWith,
    tab,
    id,
    profilePicture,
    viewed,
    senderName,
    currentUser,
    index,
    currentIndex
}) {
    const [hoverState, setHoverState] = useState({
        avatarHover: false,
    });

    function handleAvatarHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                avatarHover: !prevState.avatarHover,
            };
        });
    }

    const avatarStyle = {
        boxShadow: hoverState.avatarHover
            ? "0 0 5px rgba(134, 63, 217, .9)"
            : "none",
        cursor: hoverState.avatarHover ? "pointer" : "default",
    };

    return (
        <div key={id} className="chatroom--member-wrapper" style={{transform: `translate(-${currentIndex * 100}%)`}}>
            {!viewed && senderName != currentUser.name && (
                <div className="chatroom--new">New!</div>
            )}
            <img
                src={"data:image/png;base64," + profilePicture}
                className={`chatroom--member${
                    tab === conversationWith ? "-active" : ""
                }`}
                onClick={() =>
                    (window.location = `http://localhost:3000/messages/${conversationWith}`)
                }
                style={avatarStyle}
                onMouseEnter={handleAvatarHover}
                onMouseLeave={handleAvatarHover}
            ></img>
            <p className="chatroom--preview-username">{conversationWith}</p>
        </div>
    );
}