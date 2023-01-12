import {
    Link,
    useParams,
    useLocation,
    NavLink,
    Router,
    Route,
} from "react-router-dom";
import Navbar from "./Navbar";
import Extra from "./Extra";
import PostModal from "./PostModal";
import Post from "./Post";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";
import Header from "./Header";
import { ColorRing } from "react-loader-spinner";
import EditModal from "./EditModal";
import { BsEnvelope } from "react-icons/bs";

export default function Profile(props) {
    const [profileDetails, setProfileDetails] = useState({
        username: null,
        fullName: null,
        bio: null,
        followed: false,
        posts: null,
        followers: 0,
        following: 0,
    });
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { handle } = useParams();
    const [isUserProfile, setIsUserProfile] = useState(false);
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [hoverState, setHoverState] = useState({
        followHover: false,
        followersHover: false,
        followingHover: false,
        postsHover: false,
        likesHover: false,
    });
    const currentLocation = useLocation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentLocation.pathname == `/${handle}`) {
            fetch(`http://localhost:8080/${handle}/posts?page=${page}`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => {
                    if (res.status === 400) {
                        localStorage.setItem("userDetails", null);
                        window.location = "http://localhost:3000/login";
                    }
                    return res.json();
                })
                .then((data) => {
                    // console.log(data);
                    if (data.posts.length <= 0 || data.posts.length >= 200) {
                        setHasMore(false);
                    } else {
                        setProfileDetails(data);
                        setPosts((prev) => {
                            return [...prev, ...data.posts];
                        });
                    }
                });
        } else if (currentLocation.pathname == `/${handle}/likes`) {
            fetch(`http://localhost:8080/${handle}/likes?page=${page}`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => {
                    if (res.status === 400) {
                        localStorage.setItem("userDetails", null);
                        window.location = "http://localhost:3000/login";
                    }
                    return res.json();
                })
                .then((data) => {
                    console.log(data);
                    if (data.posts.length <= 0 || data.posts.length >= 200) {
                        setHasMore(false);
                    } else {
                        setPosts((prev) => {
                            return [...prev, ...data.posts];
                        });
                    }
                    setProfileDetails(data);
                });
        }
    }, [page]);

    function fetchMoreData() {
        setTimeout(() => {
            setPage((prev) => prev + 1);
        }, 500);
    }

    //checks if this page is the users profile
    useEffect(() => {
        if (userDetails == null) {
            setIsUserProfile(false);
        } else {
            if (profileDetails.username === userDetails.name) {
                setIsUserProfile(true);
            } else {
                setIsUserProfile(false);
                fetch(`http://localhost:8080/isAuth`, {
                    method: "GET",
                    credentials: "include",
                })
                    .then((res) => res)
                    .then((data) => {
                        if (data.status == 204) {
                            localStorage.setItem("userDetails", null);
                        }
                    });
            }
        }
    }, [profileDetails.username]);

    const followStyle = {
        background: hoverState.followHover
            ? profileDetails.followed
                ? "rgba(255, 131, 133, 0.23)"
                : "rgba(48, 48, 48, 1)"
            : profileDetails.followed
            ? "white"
            : "black",
        color: hoverState.followHover
            ? profileDetails.followed
                ? "rgba(250, 0, 0, 1)"
                : "white"
            : profileDetails.followed
            ? "black"
            : "white",
        border: hoverState.followHover
            ? profileDetails.followed
                ? "1px solid rgba(255, 131, 133, 0.23)"
                : "1x solid rgba(33, 33, 33, .8)"
            : "1px solid #e8e8e8",
        cursor: hoverState.followHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const editStyle = {
        background: hoverState.editHover ? "black" : "white",
        color: hoverState.editHover ? "white" : "black",
        cursor: hoverState.editHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const followersStyle = {
        textDecoration: hoverState.followersHover ? "underline" : "none",
        cursor: hoverState.followersHover ? "pointer" : "none",
    };

    const followingStyle = {
        textDecoration: hoverState.followingHover ? "underline" : "none",
        cursor: hoverState.followingHover ? "pointer" : "none",
    };

    const postTabStyle = {
        borderBottom:
            currentLocation.pathname == `/${handle}`
                ? "5px solid rgba(134, 63, 217, .9)"
                : "none",
        color: currentLocation.pathname == `/${handle}` ? "black" : "#757575",
        transition: "all .08s linear",
    };

    const postsTabButtonStyle = {
        background: hoverState.postsHover ? "#eae6ed" : "#f6f6f6",
        cursor: hoverState.postsHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const likesTabButtonStyle = {
        background: hoverState.likesHover ? "#eae6ed" : "#f6f6f6",
        cursor: hoverState.likesHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const likeTabStyle = {
        borderBottom:
            currentLocation.pathname == `/${handle}/likes`
                ? "5px solid rgba(134, 63, 217, .9)"
                : "none",
        color:
            currentLocation.pathname == `/${handle}/likes`
                ? "black"
                : "#757575",
        transition: "all .08s linear",
    };

    function handlePostsHover() {
        setHoverState((prevState) => ({
            ...prevState,
            postsHover: !prevState.postsHover,
        }));
    }

    function handleLikesHover() {
        setHoverState((prevState) => ({
            ...prevState,
            likesHover: !prevState.likesHover,
        }));
    }

    function handleFollowHover() {
        setHoverState((prevState) => ({
            ...prevState,
            followHover: !prevState.followHover,
        }));
    }

    function handleEditHover() {
        setHoverState((prevState) => ({
            ...prevState,
            editHover: !prevState.editHover,
        }));
    }

    function handleFollowersHover() {
        setHoverState((prevState) => ({
            ...prevState,
            followersHover: !prevState.followersHover,
        }));
    }

    function handleFollowingHover() {
        setHoverState((prevState) => ({
            ...prevState,
            followingHover: !prevState.followingHover,
        }));
    }

    function handleFollow() {
        if (userDetails == null) {
            window.location = "http://localhost:3000/login";
        }
        fetch(`http://localhost:8080/${handle}/follow`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.text())
            .then((data) => {
                if (data == "success") {
                    setProfileDetails((prev) => ({ ...prev, followed: true }));
                } else if (data == "failure") {
                    setProfileDetails((prev) => ({ ...prev, followed: false }));
                } else {
                    window.location = "http://localhost:3000/login";
                }
            });
    }

    const [profilePicture, setProfilePicture] = useState();
    useEffect(() => {
        setProfilePicture(
            "data:image/png;base64," + profileDetails.profilePicture
        );
        if (profileDetails.profilePicture != undefined) {
            setLoading(false);
        }
    }, [profileDetails]);

    const [postElements, setPostElements] = useState(null);

    useEffect(() => {
        setPostElements(
            posts?.map((post) => {
                const replyTo =
                    post.replyTo == null ? null : post.replyTo.author.username;
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
                        replyTo={replyTo}
                        comments={post.comments}
                        modalState={props.modalState}
                        openModal={props.toggleModal}
                        isAuth={props.isAuth}
                        isHome={false}
                        profilePicture={post.profPicBytes}
                        menuState={post.menuState}
                        handleMenuToggle={handleMenuToggle}
                    />
                );
            })
        );
        // console.log(posts);
    }, [posts]);

    function handleMenuToggle(id) {
        setPosts((prevState) => {
            return prevState.map((post) => {
                return id == post.id
                    ? { ...post, menuState: true }
                    : { ...post, menuState: false };
            });
        });
    }

    // console.log(profileDetails);

    return (
        <div className="profile">
            <Navbar />
            {!loading ? (
                <div className="profile--middle">
                    <div className="profile--content">
                        <img
                            src={"../images/background.jpg"}
                            className="profile--background"
                        ></img>
                        <div className="profile--edit-wrapper">
                            {!isUserProfile && (
                                <div
                                    className="profile--message"
                                    onClick={() =>
                                        (window.location = `http://localhost:3000/messages/${profileDetails.username}`)
                                    }
                                >
                                    <BsEnvelope />
                                </div>
                            )}
                            {isUserProfile && props.isAuth ? (
                                <button
                                    className="profile--edit"
                                    style={editStyle}
                                    onMouseEnter={handleEditHover}
                                    onMouseLeave={handleEditHover}
                                    onClick={() => props.toggleEdit()}
                                >
                                    Edit profile
                                </button>
                            ) : (
                                <button
                                    className="profile--follow"
                                    style={followStyle}
                                    onClick={handleFollow}
                                    onMouseEnter={handleFollowHover}
                                    onMouseLeave={handleFollowHover}
                                >
                                    {profileDetails.followed
                                        ? hoverState.followHover
                                            ? "Unfollow"
                                            : "Following"
                                        : "Follow"}
                                </button>
                            )}
                        </div>
                        <img
                            src={profilePicture}
                            className="profile--image"
                        ></img>
                        <div className="profile--details">
                            <div className="profile--username-wrapper">
                                <p className="profile--username">
                                    {profileDetails.username}
                                </p>
                                {profileDetails?.followedBy && (
                                    <div className="profile--followsyou-wrapper">
                                        <p className="profile--followsyou">
                                            Follows you
                                        </p>
                                    </div>
                                )}
                            </div>
                            <p className="profile--fullname">
                                {profileDetails.fullName}
                            </p>
                            <p className="profile--bio">{profileDetails.bio}</p>
                        </div>
                        <div className="profile--follow-details">
                            <div
                                className="profile--followers"
                                onClick={() =>
                                    (window.location = `http://localhost:3000/${handle}/followers`)
                                }
                            >
                                <h4>{profileDetails.followers}</h4>
                                <p
                                    style={followersStyle}
                                    onMouseEnter={handleFollowersHover}
                                    onMouseLeave={handleFollowersHover}
                                >
                                    Followers
                                </p>
                            </div>
                            <div
                                className="profile--following"
                                onClick={() =>
                                    (window.location = `http://localhost:3000/${handle}/following`)
                                }
                            >
                                <h4>{profileDetails.following}</h4>
                                <p
                                    style={followingStyle}
                                    onMouseEnter={handleFollowingHover}
                                    onMouseLeave={handleFollowingHover}
                                >
                                    Following
                                </p>
                            </div>
                        </div>
                        <div className="profile--navbar">
                            <button
                                className="profile--navbutton"
                                onClick={() =>
                                    (window.location = `http://localhost:3000/${handle}`)
                                }
                                style={postsTabButtonStyle}
                                onMouseEnter={handlePostsHover}
                                onMouseLeave={handlePostsHover}
                            >
                                <h4
                                    className="profile--nav-text"
                                    style={postTabStyle}
                                >
                                    Posts
                                </h4>
                            </button>
                            {/* <button className="profile--navbutton">
                            <h4 className="profile--nav-text">Reposts</h4>
                        </button> */}
                            <button
                                className="profile--navbutton"
                                onClick={() =>
                                    (window.location = `http://localhost:3000/${handle}/likes`)
                                }
                                style={likesTabButtonStyle}
                                onMouseEnter={handleLikesHover}
                                onMouseLeave={handleLikesHover}
                            >
                                <h4
                                    className="profile--nav-text"
                                    style={likeTabStyle}
                                >
                                    Likes
                                </h4>
                            </button>
                        </div>
                    </div>
                    <div>
                        <InfiniteScroll
                            dataLength={posts.length}
                            className="timeline"
                            style={{ overflow: "hidden" }}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            endMessage={<p>You're all up to date!</p>}
                            loader={
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
                            }
                        >
                            {postElements}
                        </InfiniteScroll>
                    </div>
                </div>
            ) : (
                <div className="profile--middle">
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
            <EditModal
                open={props.editModalState}
                toggleEdit={props.toggleEdit}
                oldImg={profilePicture}
            />
        </div>
    );
}
//do not allow users to press the profile button if not logged in

//next to followers and following add a posts tab to show the amount
