import {
    BsFillHandThumbsUpFill,
    BsChatDotsFill,
    BsArrowRepeat,
    BsThreeDots,
} from "react-icons/bs";
import { useState, useEffect } from "react";
import { hover } from "@testing-library/user-event/dist/hover";
import { Link, useParams } from "react-router-dom";
import PostMenu from "./PostMenu";

export default function Post(props) {
    const [state, setState] = useState(props); //post state
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [interactions, setInteractions] = useState({
        toggleComment: false,
        comments: [""],
    });
    const [hoverState, setHoverState] = useState({
        mainHover: false,
        likeHover: false,
        repostHover: false,
        commentHover: false,
        usernameHover: false,
        repostedByHover: false,
        menuHover: false,
    });
    const { handle } = useParams();
    const [profilePicture, setProfilePicture] = useState(null);
    const [postHeight, setPostHeight] = useState(null);

    const date = new Date(); //raw
    date.setTime(state.postDate);
    const currentDate = new Date(); //current
    let unit;
    const postDate = () => {
        let returnDate = Math.floor(
            currentDate.getTime() / 3600000 - date.getTime() / 3600000
        );
        if (returnDate == 0) {
            unit = "mins ago";
            return Math.floor(
                currentDate.getTime() / 60000 - date.getTime() / 60000
            );
        }
        if (returnDate >= 24) {
            unit = "";
            switch (date.getMonth()) {
                case 0:
                    returnDate = ["Jan ", date.getDate()];
                    break;
                case 1:
                    returnDate = ["Feb ", date.getDate()];
                    break;
                case 2:
                    returnDate = ["Mar ", date.getDate()];
                    break;
                case 3:
                    returnDate = ["Apr ", date.getDate()];
                    break;
                case 4:
                    returnDate = ["May ", date.getDate()];
                    break;
                case 5:
                    returnDate = ["June ", date.getDate()];
                    break;
                case 6:
                    returnDate = ["July ", date.getDate()];
                    break;
                case 7:
                    returnDate = ["Aug ", date.getDate()];
                    break;
                case 8:
                    returnDate = ["Sep ", date.getDate()];
                    break;
                case 9:
                    returnDate = ["Oct ", date.getDate()];
                    break;
                case 10:
                    returnDate = ["Nov ", date.getDate()];
                    break;
                case 11:
                    returnDate = ["Dec ", date.getDate()];
                    break;
            }
            return returnDate;
        }
        unit = "hours ago";
        return returnDate;
    };

    const postMessage = () => {
        //this function runs if on home page
        if (state.author.username == state.repostedBy) {
            return "Reposted ";
        }
        if (state.author.username != handle) {
            return "Reposted ";
        }
        if (state.isReposted) {
            if (userDetails == null) {
                return "Posted ";
            }
            return state.author.username == userDetails.name
                ? "Reposted "
                : "Posted ";
        }
        return "Posted ";
        /* i realize i did this in like the most inefficient way possible
        but i didnt want to have to rewrite the post hydration algorithm on
        the backend just for this little feature*/
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    //if i wanted to increase performance i would put the listener and
    //the function in a higher component

    //-----general post stuff-------

    function openPost() {
        const handle =
            state.author.username == "Me"
                ? userDetails.name
                : state.author.username;
        window.location = `http://localhost:3000/${handle}/post/${state.id}?repost=${state.repostedBy}`;
    }

    function handlePostMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            mainHover: !prevState.mainHover,
        }));
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setInteractions((prevState) => ({ ...prevState, [name]: value }));
    }

    function handleUsernameClick(e) {
        e.stopPropagation();
        const handle =
            state.author.username == "Me"
                ? userDetails.name
                : state.author.username;
        window.location = `http://localhost:3000/${handle}`;
    }

    function handleRepostUserClick(e) {
        e.stopPropagation();
        window.location = `http://localhost:3000/${state.repostedBy}`;
    }

    function handleUsernameMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            usernameHover: !prevState.usernameHover,
        }));
    }

    function handleRepostedByMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            repostedByHover: !prevState.repostedByHover,
        }));
    }

    function handleMenuHover() {
        setHoverState((prevState) => ({
            ...prevState,
            menuHover: !prevState.menuHover,
        }));
    }

    function handleScroll() {
        props.handleMenuToggle();
    }

    const repostedByStyle = {
        textDecoration: hoverState.repostedByHover ? "underline" : "none",
    };

    const usernameStyle = {
        textDecoration: hoverState.usernameHover ? "underline" : "none",
    };

    const postStyles = {
        background: hoverState.mainHover ? "#eae6ed" : "#f6f6f6",
        cursor: hoverState.mainHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const menuStyle = {
        background: hoverState.menuHover ? "#eae6ed" : "none",
        cursor: hoverState.menuHover ? "pointer" : "none",
        transition: "all .08s linear",
    };
    //------------------------------

    //-----like feature styling-----
    const likeTextStyles = {
        color: state.isLiked ? "#de4b4b" : "#8a8a8a",
        transition: "all .08s linear",
    };

    const likeIconStyles = {
        background: hoverState.likeHover
            ? "rgba(255, 131, 133, 0.13)"
            : "#fafafa",
        transition: "all .08s linear",
    };

    function handleLikeMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            likeHover: !prevState.likeHover,
        }));
    }

    function toggleLike(e) {
        e.stopPropagation();
        fetch(`http://localhost:8080/handle-like?id=${state.id}`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setState((prevState) => {
                    return {
                        ...prevState,
                        isLiked: !prevState.isLiked,
                        likes: data,
                    };
                });
            })
            .catch(() => {
                window.location = "http://localhost:3000/login";
            });
    }
    //------------------------------

    //-----repost feature styling-----
    const repostTextStyles = {
        color: state.isReposted ? "#42ba0d" : "#8a8a8a",
        transition: "all .1s linear",
    };

    const repostIconStyles = {
        background: hoverState.repostHover
            ? "rgba(74, 171, 32, 0.13)"
            : "#fafafa",
        transition: "all .08s linear",
    };

    function handleRepostMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            repostHover: !prevState.repostHover,
        }));
    }

    function toggleRepost(e) {
        e.stopPropagation();
        fetch(`http://localhost:8080/handle-repost?id=${state.id}`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        isReposted: !prevState.isReposted,
                        reposts: data,
                    };
                });
            })
            .catch(() => {
                window.location = "http://localhost:3000/login";
            });
    }
    //------------------------------

    //-----comment feature styling-----
    const commentTextStyles = {
        color: interactions.toggleComment ? "rgba(34, 58, 214, .6)" : "#8a8a8a",
        transition: "all .08s linear",
    };

    const commentIconStyles = {
        background: hoverState.commentHover
            ? "rgba(58, 83, 242, 0.13)"
            : "#fafafa",
        transition: "all .08s linear",
    };

    function handleCommentMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            commentHover: !prevState.commentHover,
        }));
    }

    function handleCommentToggle(e) {
        e.stopPropagation();
        props.openModal(state);
    }

    //------------------------------

    useEffect(() => {
        setProfilePicture("data:image/png;base64," + state.profilePicture);
    }, [state]);

    return (
        <div
            className="post--wrapper"
            onMouseEnter={handlePostMouseOver}
            onMouseLeave={handlePostMouseOver}
            style={postStyles}
            name="mainHover"
            onClick={openPost}
            id={state.id}
        >
            {props.menuState && (
                <PostMenu
                    handleMenuToggle={props.handleMenuToggle}
                    currentUsername={state.author.username}
                    id={state.id}
                />
            )}
            <div className="post">
                <div className="post--left">
                    <div className="post--pic-wrapper">
                        <img src={profilePicture} className="post--pic" />
                    </div>
                    {state.isThread && state.comments.length > 0 && (
                        <div className="post--thread"></div>
                    )}
                </div>
                <div className="post--right">
                    {state.repostedBy && (
                        <small
                            className="post--reposted-by"
                            onMouseEnter={handleRepostedByMouseOver}
                            onMouseLeave={handleRepostedByMouseOver}
                            style={repostedByStyle}
                            onClick={handleRepostUserClick}
                        >
                            <div className="post--top-icon">
                                <BsArrowRepeat />
                            </div>
                            Reposted by{" "}
                            {state.repostedBy == userDetails?.name
                                ? "me"
                                : state.repostedBy}
                        </small>
                    )}
                    <div className="post--main">
                        <div className="post--main-top">
                            <div className="post--username-wrapper">
                                <h1
                                    className="post--username"
                                    onClick={handleUsernameClick}
                                    style={usernameStyle}
                                    onMouseEnter={handleUsernameMouseOver}
                                    onMouseLeave={handleUsernameMouseOver}
                                >
                                    {state.author.username}
                                </h1>
                            </div>
                            <div
                                className="post--menu-wrapper"
                                style={menuStyle}
                                onMouseEnter={handleMenuHover}
                                onMouseLeave={handleMenuHover}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.handleMenuToggle(state.id);
                                }}
                            >
                                <BsThreeDots />
                            </div>
                        </div>
                        {props.replyTo != null && (
                            <p className="post--reply-to">
                                Reply to {props.replyTo}
                            </p>
                        )}
                        <p className="post--text">{state.content}</p>
                    </div>

                    <footer className="post--footer">
                        <div
                            className="post--likes"
                            onMouseEnter={handleLikeMouseOver}
                            onMouseLeave={handleLikeMouseOver}
                            style={likeTextStyles}
                            onClick={toggleLike}
                        >
                            <div
                                className="post--icon-wrapper"
                                style={likeIconStyles}
                                name="isLiked"
                            >
                                <BsFillHandThumbsUpFill />
                            </div>
                            <p name="like">{state.likes.length}</p>
                        </div>

                        <div
                            className="post--reposts"
                            onMouseEnter={handleRepostMouseOver}
                            onMouseLeave={handleRepostMouseOver}
                            style={repostTextStyles}
                            onClick={toggleRepost}
                        >
                            <div
                                className="post--icon-wrapper"
                                style={repostIconStyles}
                                name="isReposted"
                            >
                                <BsArrowRepeat />
                            </div>
                            <p name="repost">{state.reposts}</p>
                        </div>

                        <div
                            className="post--comments"
                            onClick={handleCommentToggle}
                            onMouseEnter={handleCommentMouseOver}
                            onMouseLeave={handleCommentMouseOver}
                            style={commentTextStyles}
                        >
                            <div
                                className="post--icon-wrapper"
                                style={commentIconStyles}
                                name="toggleComment"
                            >
                                <BsChatDotsFill />
                            </div>
                            <p name="comments" value={state.comment}>
                                {state.comments != null
                                    ? state.comments.length
                                    : ""}
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
            {interactions.toggleComment && (
                <div className="post--comment-area-wrapper">
                    <textarea
                        type="text"
                        placeholder="comment"
                        className="post--comment-area"
                        name="comment"
                        value={interactions.comments}
                        onChange={handleChange}
                    />
                    <div className="post--submit-wrapper">
                        <button className="post--submit-button">Reply</button>
                    </div>
                </div>
            )}
            <div>
                <p className="post--postdate">
                    {props.isHome
                        ? state.isReposted
                            ? "Reposted "
                            : state.repostedBy == null
                            ? "Posted "
                            : "Reposted "
                        : postMessage()}
                    {JSON.stringify(Number(postDate())) == "null"
                        ? ["on ", postDate()]
                        : [postDate(), " ", unit]}
                </p>
            </div>
        </div>
    );
}
//350 char limit per post
//if you get an error working on comments it might be because
//of state.comment btw
