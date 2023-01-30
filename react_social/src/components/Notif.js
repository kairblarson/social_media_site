import { useState, useEffect } from "react";
import {
    BsFillHandThumbsUpFill,
    BsChatDotsFill,
    BsArrowRepeat,
    BsPersonFill,
    BsQuestionCircle,
} from "react-icons/bs";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Post from "./Post";

//nav done //local done
export default function Notif({
    action,
    id,
    content,
    from,
    date,
    ppCDNLink,
    comment,
}) {
    const [hoverState, setHoverState] = useState({
        mainHover: false,
        usernameHover: false,
    });
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const navigate = useNavigate();

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
            case "reply":
                component = <BsChatDotsFill />;
                break;
            default:
                component = <BsQuestionCircle />;
                break;
        }
        return component;
    };

    function actionToText() {
        let text;
        switch (action) {
            case "like":
                text = "liked your post";
                break;
            case "repost":
                text = "reposted your post";
                break;
            case "follow":
                text = "followed you";
                break;
            case "reply":
                text = "replied to your post";
                break;
            default:
                text = "something went wrong...";
                break;
        }
        return text;
    }

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
        navigate(`/${from.username}`);
    }

    function handleNotifClick() {
        if (content == null) {
            navigate(`/${from.username}`);
        }
        navigate(
            `/${currentUser.name}/post/${content.id}?repost=${
                action == "repost" ? from.username : "null"
            }`
        );
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
                    <img src={ppCDNLink} className="notif--img" />
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
                    {content != null && actionToText()}
                </div>
                {content != null && (
                    <div className="notif--content" style={{color: comment != null ? "black" : "#757575"}}>
                        {content.deleted
                            ? "This post has been deleted..."
                            : content.content}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
