import { useState, useEffect } from "react";
import { BsCursor } from "react-icons/bs";

export default function Sender({ sendPrivateMessage, tab }) {
    const [isBlocked, setBlocked] = useState(true);
    const [userData, setUserData] = useState({
        username: "",
        receivername: "",
        connected: false,
        message: "",
    });
    const [hoverState, setHoverState] = useState({
        sendButtonHover: false,
    });

    function handleMessage(event) {
        const { value } = event.target;
        setUserData({ ...userData, message: value });
    }

    useEffect(() => {
        if (userData.message.length > 0) {
            setBlocked(false);
        } else {
            setBlocked(true);
        }
    }, [userData.message]);

    const sendButtonStyle = {
        color: isBlocked ? "rgba(134, 63, 217, .5)" : "rgba(134, 63, 217, 1)",
        cursor: hoverState.sendButtonHover
            ? isBlocked
                ? "default"
                : "pointer"
            : "default",
    };

    function handleSendButtonHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                sendButtonHover: !prevState.sendButtonHover,
            };
        });
    }

    return (
        <div className="chatroom--sender">
            <input
                type="text"
                className="chatroom--input-box"
                placeholder="Type here"
                value={userData.message}
                onChange={handleMessage}
                maxLength={200}
            />
            <div
                className="chatroom--send-button"
                onClick={() => {
                    sendPrivateMessage(userData.message, isBlocked);
                    setUserData((prevState) => ({
                        ...prevState,
                        message: "",
                    }));
                }}
                style={sendButtonStyle}
                onMouseEnter={handleSendButtonHover}
                onMouseLeave={handleSendButtonHover}
            >
                <BsCursor />
            </div>
        </div>
    );
}
