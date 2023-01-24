import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

//nav done //local done
export default function Simple({
    username,
    fullName,
    bio,
    followed,
    profilePicture,
    ppCDNLink
}) {
    const [isFollowed, setFollowed] = useState(followed);
    const [hoverState, setHoverState] = useState({
        postHover: false,
        followHover: false,
    });
    const { handle } = useParams();
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [isSelf, setSelf] = useState(username == currentUser?.name);
    const navigate = useNavigate();

    const followStyle = {
        background: isFollowed
            ? hoverState.followHover
                ? "rgba(255, 131, 133, 0.23)"
                : "white"
            : hoverState.followHover
            ? "rgba(48, 48, 48, 1)"
            : "black",
        color: hoverState.followHover
            ? isFollowed
                ? "rgba(250, 0, 0, 1)"
                : "white"
            : isFollowed
            ? "black"
            : "white",
        border: hoverState.followHover
            ? isFollowed
                ? "1px solid rgba(255, 131, 133, 0.23)"
                : "1x solid rgba(33, 33, 33, .8)"
            : isFollowed
            ? "1px solid #e8e8e8"
            : "none",
        transition: "all .08s linear",
        cursor: hoverState.followHover ? "pointer" : "none",
    };

    const postStyle = {
        background: hoverState.postHover ? "#e8e8e8" : "white",
        cursor: hoverState.postHover ? "pointer" : "none",
    };

    function handleHover() {
        setHoverState((prevState) => ({
            ...prevState,
            followHover: !prevState.followHover,
        }));
    }

    function handlePostHover() {
        setHoverState((prevState) => ({
            ...prevState,
            postHover: !prevState.postHover,
        }));
    }

    function toggleFollow(e) {
        e.stopPropagation();
        if (currentUser == null) {
            navigate("/login");
        }
        fetch(`${process.env.REACT_APP_BASE_URL}/${username}/follow`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.text())
            .then((data) => {
                if (data == "success") {
                    setFollowed((prev) => !prev);
                } else if (data == "failure") {
                    setFollowed((prev) => !prev);
                } else {
                    navigate("/login");
                }
            });
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
            className="simple"
            style={postStyle}
            onMouseEnter={handlePostHover}
            onMouseLeave={handlePostHover}
            onClick={() => navigate(`/${username}`)}
        >
            <div className="simple--left">
                <img
                    src={ppCDNLink}
                    className="simple--pic"
                />
            </div>
            <div className="simple--middle">
                <div className="simple--top">
                    <h4 className="simple--username">{username}</h4>
                    <p className="simple--fullName">{fullName}</p>
                </div>
                <small className="simple--bio">
                    {bio == null ? "No bio" : bio}
                </small>
            </div>
            <div className="simple--right">
                {!isSelf && (
                    <button
                        className="simple--follow"
                        style={followStyle}
                        onMouseEnter={handleHover}
                        onMouseLeave={handleHover}
                        onClick={toggleFollow}
                    >
                        {isFollowed
                            ? hoverState.followHover
                                ? "Unfollow"
                                : "Following"
                            : "Follow"}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
//simple user display for showing a list of users ex: follwers/following list
