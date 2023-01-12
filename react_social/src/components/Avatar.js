import { useState, useEffect } from "react";

export default function Avatar({ conversationWith, tab, id }) {
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
        cursor: hoverState.avatarHover ? "pointer" : "none"
    };

    return (
        <div key={id} className="chatroom--member-wrapper">
            <img
                src="../images/defualt_pic.png"
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
            <p className="chatroom--preview-username">
                {conversationWith}
            </p>
        </div>
    );
}
