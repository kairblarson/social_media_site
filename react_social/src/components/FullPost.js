import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Extra from "./Extra";
import PostModal from "./PostModal";
import Navbar from "./Navbar";
import Post from "./Post";
import {
    BsFillHandThumbsUpFill,
    BsChatDotsFill,
    BsArrowRepeat,
    BsArrowLeft,
    BsThreeDots,
} from "react-icons/bs";
import Header from "./Header";
import { ColorRing } from "react-loader-spinner";
import PostMenu from "./PostMenu";
import DeletedPost from "./DeletedPost";
import { AnimatePresence } from "framer-motion";

//nav done //local done
export default function FullPost(props) {
    const { handle, id, interaction } = useParams();
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [post, setPost] = useState({
        author: null,
        comments: [],
        content: null,
        liked: null,
        likes: 0,
        reposts: 0,
        repostedBy: null,
        reposted: false,
        replyTo: null,
    });
    const [thread, setThread] = useState([]);
    const [hoverState, setHoverState] = useState({
        likeHover: false,
        repostHover: false,
        commentHover: false,
        usernameHover: false,
        repostedByHover: false,
        repostInteractionHover: false,
        likeInteractionHover: false,
        menuHover: false,
    });
    const [targetPost, setTargetPost] = useState();
    const [fillerHeight, setFillerHeight] = useState(0);
    const search = useLocation().search;
    const repostedBy = new URLSearchParams(search).get("repost");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/${handle}/post/${id}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => {
                if (res.status === 400) {
                    localStorage.setItem("userDetails", null);
                    navigate("/login");
                }
                return res.json();
            })
            .then((data) => {
                // console.log(data);
                data.forEach((post) => {
                    if (post.focus == true) {
                        setPost(post);
                    } else {
                        setThread((prevState) => [...prevState, post]);
                    }
                });
                setLoading(true);
            })
            .catch((err) => navigate("/login"));
        setTargetPost(document.getElementById("target-post"));
    }, [window.location.pathname]);

    useEffect(() => {
        setFillerHeight(
            document.documentElement.scrollHeight - targetPost?.scrollHeight
        );
    }, [targetPost]);

    useEffect(() => {
        targetPost?.scrollIntoView();
        window.scrollBy(0, -56);
    }, [fillerHeight]);

    function convertDate() {
        const postDate = new Date(post.postDate);
        let hours = postDate.getHours();
        let minutes = postDate.getMinutes();
        let AMPM = "AM";

        if (hours > 12) {
            hours = hours - 12;
            AMPM = "PM";
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        const fullDate =
            hours +
            ":" +
            minutes +
            " " +
            AMPM +
            " " +
            postDate.toDateString().substring(4);
        return fullDate;
    }

    const usernameStyle = {
        textDecoration: hoverState.usernameHover ? "underline" : "none",
        cursor: hoverState.usernameHover ? "pointer" : "none",
    };

    function handleUsernameHover() {
        setHoverState((prevState) => ({
            ...prevState,
            usernameHover: !prevState.usernameHover,
        }));
    }

    const menuStyle = {
        background: hoverState.menuHover ? "#eae6ed" : "none",
        cursor: hoverState.menuHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    function handleMenuHover() {
        setHoverState((prevState) => ({
            ...prevState,
            menuHover: !prevState.menuHover,
        }));
    }

    const repostedByStyle = {
        textDecoration: hoverState.repostedByHover ? "underline" : "none",
        cursor: hoverState.repostedByHover ? "pointer" : "none",
    };

    function handleRepostedByHover() {
        setHoverState((prevState) => ({
            ...prevState,
            repostedByHover: !prevState.repostedByHover,
        }));
    }

    //-------like logic----------
    const likeIconStyle = {
        color: post?.liked ? "#de4b4b" : "#8a8a8a",
        transition: "all .08s linear",
    };

    const likeWrapperStyle = {
        background: hoverState.likeHover
            ? "rgba(255, 131, 133, 0.13)"
            : "#fafafa",
        cursor: hoverState.likeHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const likeInteractionStyle = {
        textDecoration: hoverState.likeInteractionHover ? "underline" : "none",
        cursor: hoverState.likeInteractionHover ? "pointer" : "none",
    };

    function handleLikeInteractionHover() {
        setHoverState((prevState) => ({
            ...prevState,
            likeInteractionHover: !prevState.likeInteractionHover,
        }));
    }

    function handleLikeMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            likeHover: !prevState.likeHover,
        }));
    }

    function toggleLike(e) {
        e.stopPropagation();
        fetch(`${process.env.REACT_APP_BASE_URL}/handle-like?id=${post.id}`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setPost((prevState) => {
                    return {
                        ...prevState,
                        liked: !prevState.liked,
                        likes: data,
                    };
                });
            })
            .catch((err) => {
                console.log(err);
                navigate("/login");
            });
    }

    function retrieveLikes() {
        navigate(`/${handle}/post/${id}/likes?repost=${repostedBy}`);
    }
    //---------------------------

    //--------repost logic-------
    const repostIconStyle = {
        color: post.reposted ? "#42ba0d" : "#8a8a8a",
        transition: "all .1s linear",
    };

    const repostWrapperStyle = {
        background: hoverState.repostHover
            ? "rgba(74, 171, 32, 0.13)"
            : "#fafafa",
        cursor: hoverState.repostHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const repostInteractionStyle = {
        textDecoration: hoverState.repostInteractionHover
            ? "underline"
            : "none",
        cursor: hoverState.repostInteractionHover ? "pointer" : "none",
    };

    function handleRepostInteractionHover() {
        setHoverState((prevState) => ({
            ...prevState,
            repostInteractionHover: !prevState.repostInteractionHover,
        }));
    }

    function handleRepostMouseOver() {
        setHoverState((prevState) => ({
            ...prevState,
            repostHover: !prevState.repostHover,
        }));
    }

    function toggleRepost(e) {
        e.stopPropagation();
        fetch(`${process.env.REACT_APP_BASE_URL}/handle-repost?id=${post.id}`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setPost((prevState) => {
                    return {
                        ...prevState,
                        reposted: !prevState.reposted,
                        reposts: data,
                    };
                });
            })
            .catch((err) => {
                console.log(err);
                navigate("/login");
            });
    }

    function retrieveReposts() {
        navigate(`/${handle}/post/${id}/reposts?repost=${repostedBy}`);
    }
    //-------------------------

    //------comment logic------
    const commentIconStyles = {
        background: hoverState.commentHover
            ? "rgba(58, 83, 242, 0.13)"
            : "#fafafa",
        cursor: hoverState.commentHover ? "pointer" : "none",
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
        if (!currentUser) {
            navigate("/login");
        } else {
            props.toggleModal(post);
        }
    }
    //----------------------

    function handleMenuToggle(id) {
        if (id == post.id) {
            setPost((prevState) => {
                return { ...prevState, menuState: true };
            });
        } else {
            setPost((prevState) => {
                const replies = prevState.comments.map((reply) => {
                    return reply.id == id
                        ? { ...reply, menuState: true }
                        : { ...reply, menuState: false };
                });
                return {
                    ...prevState,
                    menuState: false,
                    replies: [...replies],
                };
            });
            setThread((prevState) => {
                return prevState.map((post) => {
                    return id == post.id
                        ? { ...post, menuState: true }
                        : { ...post, menuState: false };
                });
            });
        }
    }

    function handleOpenFromFull() {
        setPost({
            author: null,
            comments: [],
            content: null,
            liked: null,
            likes: 0,
            reposts: 0,
            repostedBy: null,
            reposted: false,
            replyTo: null,
        });
        setThread([]);
    }

    useEffect(() => {
        window.addEventListener("scroll", handleMenuToggle);

        return () => window.removeEventListener("scroll", handleMenuToggle);
    }, []);

    return (
        <div className="fullpost">
            <Navbar />
            <div>
                <Header />
                {loading ? (
                    <div className="fullpost--middle">
                        <AnimatePresence initial={false}>
                            {thread.map((post) => {
                                let prevAuthor = null;
                                if (post.replyTo != null) {
                                    prevAuthor = post.replyTo.author.username;
                                }
                                return (
                                    <Post
                                        key={post.id}
                                        id={post.id}
                                        content={post.content}
                                        author={post.author}
                                        postDate={post.postDate}
                                        likes={post.likes}
                                        isLiked={post.liked}
                                        reposts={post.reposts}
                                        isReposted={post.reposted}
                                        repostedBy={post.repostedBy}
                                        replyTo={prevAuthor}
                                        comments={post.comments}
                                        isThread={true}
                                        modalState={props.modalState}
                                        openModal={props.toggleModal}
                                        isAuth={props.isAuth}
                                        isHome={false}
                                        profilePicture={post.profPicBytes}
                                        menuState={post.menuState}
                                        handleMenuToggle={handleMenuToggle}
                                        deleted={post.deleted}
                                        openFromFull={handleOpenFromFull}
                                    />
                                );
                            })}
                        </AnimatePresence>

                        <div
                            className="fullpost--main-wrapper"
                            id="target-post"
                        >
                            {post?.menuState && (
                                <PostMenu
                                    currentUsername={post.author.username}
                                    id={post.id}
                                />
                            )}
                            {!post.deleted ? (
                                <div className="fullpost--main">
                                    {repostedBy != "null" && (
                                        <div
                                            className="fullpost--repostedBy"
                                            onClick={() => {
                                                navigate(
                                                    `/${
                                                        repostedBy == "me"
                                                            ? currentUser?.name
                                                            : repostedBy
                                                    }`
                                                );
                                            }}
                                            style={repostedByStyle}
                                            onMouseEnter={handleRepostedByHover}
                                            onMouseLeave={handleRepostedByHover}
                                        >
                                            <p className="fullpost--top-icon">
                                                <BsArrowRepeat />
                                            </p>
                                            Reposted by{" "}
                                            {repostedBy == currentUser?.name
                                                ? "me"
                                                : repostedBy}
                                        </div>
                                    )}
                                    <div className="fullpost--top">
                                        <div className="fullpost--image-wrapper">
                                            {post.author ? (
                                                <img
                                                    src={
                                                        "data:image/png;base64," +
                                                        post.profPicBytes
                                                    }
                                                    className="fullpost--image"
                                                />
                                            ) : (
                                                <div className="fullpost--image-pre"></div>
                                            )}
                                        </div>
                                        {post.author != null && (
                                            <div className="fullpost--author">
                                                <h4
                                                    className="fullpost--username"
                                                    onClick={() =>
                                                        navigate(`/${handle}`)
                                                    }
                                                    style={usernameStyle}
                                                    onMouseEnter={
                                                        handleUsernameHover
                                                    }
                                                    onMouseLeave={
                                                        handleUsernameHover
                                                    }
                                                >
                                                    {post.author.username}
                                                </h4>
                                                <p className="fullpost--fullname">
                                                    {post.author.fullName}
                                                </p>
                                            </div>
                                        )}
                                        <div className="fullpost--dots-wrapper">
                                            <div
                                                style={menuStyle}
                                                onMouseEnter={handleMenuHover}
                                                onMouseLeave={handleMenuHover}
                                                className="fullpost--menu"
                                                onClick={() => {
                                                    handleMenuToggle(post.id);
                                                }}
                                            >
                                                <BsThreeDots />
                                            </div>
                                        </div>
                                    </div>
                                    {post.replyTo != null && (
                                        <div className="fullpost--replyTo">
                                            <p>
                                                Reply To{" "}
                                                {post.replyTo.author.username}
                                            </p>
                                        </div>
                                    )}
                                    <div className="fullpost--content-wrapper">
                                        <p className="fullpost--content">
                                            {post.content != null &&
                                                post.content}
                                        </p>
                                    </div>
                                    <div className="fullpost--postDate">
                                        {post.author && convertDate()}
                                    </div>
                                    <div className="fullpost--interactions">
                                        <div
                                            className="fullpost--likes"
                                            onClick={retrieveLikes}
                                            style={likeInteractionStyle}
                                            onMouseEnter={
                                                handleLikeInteractionHover
                                            }
                                            onMouseLeave={
                                                handleLikeInteractionHover
                                            }
                                        >
                                            <p className="fullpost--interaction-number">
                                                {post.author &&
                                                    post.likes.length}
                                            </p>
                                            <p className="fullpost--interaction-text">
                                                Likes
                                            </p>
                                        </div>
                                        <div
                                            className="fullpost--reposts"
                                            onClick={retrieveReposts}
                                            style={repostInteractionStyle}
                                            onMouseEnter={
                                                handleRepostInteractionHover
                                            }
                                            onMouseLeave={
                                                handleRepostInteractionHover
                                            }
                                        >
                                            <p className="fullpost--interaction-number">
                                                {post.author && post.reposts}
                                            </p>
                                            <p className="fullpost--interaction-text">
                                                Reposts
                                            </p>
                                        </div>
                                    </div>
                                    <div className="fullpost--footer">
                                        <div
                                            className="fullpost--bubble"
                                            onClick={toggleLike}
                                            style={likeWrapperStyle}
                                            onMouseEnter={handleLikeMouseOver}
                                            onMouseLeave={handleLikeMouseOver}
                                        >
                                            <BsFillHandThumbsUpFill
                                                style={likeIconStyle}
                                            />
                                        </div>
                                        <div
                                            className="fullpost--bubble"
                                            style={repostWrapperStyle}
                                            onMouseEnter={handleRepostMouseOver}
                                            onMouseLeave={handleRepostMouseOver}
                                            onClick={toggleRepost}
                                        >
                                            <BsArrowRepeat
                                                style={repostIconStyle}
                                            />
                                        </div>
                                        <div
                                            className="fullpost--bubble"
                                            onMouseEnter={
                                                handleCommentMouseOver
                                            }
                                            onMouseLeave={
                                                handleCommentMouseOver
                                            }
                                            style={commentIconStyles}
                                            onClick={handleCommentToggle}
                                        >
                                            <BsChatDotsFill />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <DeletedPost />
                            )}
                        </div>
                        {post?.replies?.map((comment) => {
                            return (
                                <Post
                                    key={comment.id}
                                    id={comment.id}
                                    content={comment.content}
                                    author={comment.author}
                                    postDate={comment.postDate}
                                    likes={comment.likes}
                                    isLiked={comment.liked}
                                    reposts={comment.reposts}
                                    isReposted={comment.reposted}
                                    repostedBy={comment.repostedBy}
                                    replyTo={post.author.username}
                                    comments={comment.comments}
                                    isThread={true}
                                    modalState={props.modalState}
                                    openModal={props.toggleModal}
                                    isAuth={props.isAuth}
                                    isHome={false}
                                    profilePicture={comment.profPicBytes}
                                    menuState={comment.menuState}
                                    handleMenuToggle={handleMenuToggle}
                                    deleted={comment.deleted}
                                    openFromFull={handleOpenFromFull}
                                />
                            );
                        })}
                        {document.getElementById("target-post") != null &&
                            document.getElementById("target-post")
                                .scrollHeight != 0 && (
                                <div
                                    style={{
                                        height: fillerHeight,
                                    }}
                                    className="fullpost--filler-height"
                                ></div>
                            )}
                    </div>
                ) : (
                    <div className="fullpost--middle">
                        <ColorRing
                            visible={true}
                            height="80"
                            width="80"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={[
                                "rgba(134, 63, 217, .9)",
                                "rgba(134, 63, 217, .7)",
                                "rgba(134, 63, 217, .5)",
                                "rgba(134, 63, 217, .3)",
                                "rgba(134, 63, 217, .1)",
                            ]}
                        />
                    </div>
                )}
            </div>
            <Extra
                modalState={props.modalState}
                openModal={props.toggleModal}
                isAuth={props.isAuth}
            />
            <PostModal
                open={props.modalState}
                closeModal={props.toggleModal}
                onSubmit={props.handleSubmit}
                isAuth={props.isAuth}
                targetPost={props.targetPost}
            />
        </div>
    );
}
