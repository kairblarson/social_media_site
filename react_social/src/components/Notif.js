import { useState, useEffect } from "react";
import {
    BsFillHandThumbsUpFill,
    BsChatDotsFill,
    BsArrowRepeat,
    BsPersonFill,
} from "react-icons/bs";
import { motion } from "framer-motion";

export default function Notif({ action, id, content, from, date }) {
    const [hoverState, setHoverState] = useState({
        mainHover: false,
        usernameHover: false,
    });
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    if (action === "DM") return null;
    const actionToIcon = () => {
        let component;
        switch (action) {
            case "like":
                component = <BsFillHandThumbsUpFill />;
                break;
            case "repost":
                component = <BsArrowRepeat />;
                break;
            case "follow":
                component = <BsPersonFill />;
                break;
            default:
                component = "Unknown action";
                break;
        }
        return component;
    };
    const actionStyle = {
        color:
            action == "like"
                ? "#de4b4b"
                : action == "repost"
                ? "#42ba0d"
                : "black",
    };
    const mainStyle = {
        background: hoverState.mainHover ? "#e8e8e8" : "white",
        cursor: hoverState.mainHover ? "pointer" : "none",
        transition: "all .08s linear",
    };
    const usernameStyle = {
        textDecoration: hoverState.usernameHover ? "underline" : "none",
    };

    function handleMainHover() {
        setHoverState((prevState) => {
            return { ...prevState, mainHover: !prevState.mainHover };
        });
    }

    function handleUserameHover() {
        setHoverState((prevState) => {
            return { ...prevState, usernameHover: !prevState.usernameHover };
        });
    }

    function handleUsernameClick(e) {
        e.stopPropagation();
        window.location = `http://localhost:3000/${from.username}`;
    }

    function handleNotifClick() {
        if (content == null) {
            window.location = `http://localhost:3000/${from.username}`;
        }
        window.location = `http://localhost:3000/${currentUser.name}/post/${
            content.id
        }?repost=${action == "repost" ? from.username : "null"}`;
    }

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
            className="notif"
            style={mainStyle}
            onMouseEnter={handleMainHover}
            onMouseLeave={handleMainHover}
            onClick={handleNotifClick}
        >
            <div className="notif--left" style={actionStyle}>
                {actionToIcon()}
            </div>
            <div className="notif--right">
                <div>
                    <img
                        src={"data:image/png;base64," + from.fullImage}
                        className="notif--img"
                    />
                </div>
                <div className="notif--header">
                    <h4
                        className="notif--username"
                        onClick={handleUsernameClick}
                        style={usernameStyle}
                        onMouseEnter={handleUserameHover}
                        onMouseLeave={handleUserameHover}
                    >
                        {from.username}{" "}
                    </h4>
                    {content != null
                        ? action == "like"
                            ? " liked your post"
                            : " reposted your post"
                        : "followed you"}
                </div>
                {content != null && (
                    <div className="notif--content">
                        {content.deleted
                            ? "This post has been deleted..."
                            : content.content}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
