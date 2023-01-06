import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import PostModal from "./PostModal";
import Navbar from "./Navbar";
import Extra from "./Extra";
import Simple from "./Simple";
import InfiniteScroll from "react-infinite-scroll-component";
import { BsArrowLeft } from "react-icons/bs";
import Header from "./Header";
import { ColorRing } from "react-loader-spinner";

export default function UserList(props) {
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [users, setUsers] = useState([]);
    const { handle, interaction, id } = useParams();
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [togglePage, setTogglePage] = useState(true);
    const [hoverState, setHoverState] = useState({
        followersHover: false,
        followingHover: false,
        backHover: false,
    });
    const currentLocation = useLocation();
    const [type, setType] = useState();
    const search = useLocation().search;
    const repostedBy = new URLSearchParams(search).get("repost");

    useEffect(() => {
        if (
            currentLocation.pathname == `/${handle}/followers` ||
            currentLocation.pathname == `/${handle}/following`
        ) {
            let urlVariable;
            setType("following");
            if (currentLocation.pathname == `/${handle}/followers`) {
                urlVariable = "followers";
                setTogglePage(true);
            } else if (currentLocation.pathname == `/${handle}/following`) {
                urlVariable = "following";
                setTogglePage(false);
            }
            fetch(
                `http://localhost:8080/${handle}/${urlVariable}?page=${page}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )
                .then((res) => {
                    if (res.status === 400) {
                        localStorage.setItem("userDetails", null);
                        window.location = "http://localhost:3000/login";
                    }
                    return res.json();
                })
                .then((data) => {
                    // console.log(data);
                    if (data.length <= 0 || data.length >= 200) {
                        setHasMore(false);
                    } else {
                        setUsers((prev) => {
                            return [...prev, ...data];
                        });
                    }
                })
                .catch((err) => {});
        } else {
            console.log("PAGE",page);
            setType("interactions");
            fetch(`http://localhost:8080/${handle}/post/${id}/${interaction}?page=${page}`, {
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
                    if (data.length <= 0 || data.length >= 200) {
                        setHasMore(false);
                    } else {
                        setUsers((prev) => {
                            return [...prev, ...data];
                        });
                    }
                })
                .catch((err) => {});
        }
    }, [page]);

    function fetchMoreData() {
        setTimeout(() => {
            setPage((prev) => prev + 1);
        }, 500);
    }

    const followersStyle = {
        textAlign: "center",
        height: "100%",
        display: "flex",
        alignItems: "center",
        borderBottom: togglePage ? "4px solid rgba(134, 63, 217, .9)" : "none",
        color: togglePage ? "black" : "#757575",
        padding: "4px",
    };

    const followingStyle = {
        textAlign: "center",
        height: "100%",
        display: "flex",
        alignItems: "center",
        borderBottom: togglePage ? "none" : "4px solid rgba(134, 63, 217, .9)",
        color: togglePage ? "#757575" : "black",
        padding: "4px",
    };

    const followersWrapper = {
        background: hoverState.followersHover ? "#eae6ed" : "white",
        cursor: hoverState.followersHover ? "pointer" : "none",
    };

    const followingWrapper = {
        background: hoverState.followingHover ? "#eae6ed" : "white",
        cursor: hoverState.followingHover ? "pointer" : "none",
    };

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

    return (
        <div className="userlist">
            <Navbar />
            <div className="userlist--wrapper">
                <div className="userlist--top">
                    <Header />
                    {type == "following" && (
                        <div className="userlist--buttons">
                            <button
                                className="userlist--button"
                                onMouseEnter={handleFollowersHover}
                                onMouseLeave={handleFollowersHover}
                                style={followersWrapper}
                                onClick={() =>
                                    (window.location = `http://localhost:3000/${handle}/followers`)
                                }
                            >
                                <h4 style={followersStyle}>Followers</h4>
                            </button>
                            <button
                                className="userlist--button"
                                onMouseEnter={handleFollowingHover}
                                onMouseLeave={handleFollowingHover}
                                style={followingWrapper}
                                onClick={() =>
                                    (window.location = `http://localhost:3000/${handle}/following`)
                                }
                            >
                                <h4 style={followingStyle}>Following</h4>
                            </button>
                        </div>
                    )}
                </div>
                <InfiniteScroll
                    dataLength={users.length}
                    className="userlist--followers"
                    style={{ overflow: "hidden" }}
                    next={fetchMoreData}
                    hasMore={hasMore}
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
                    {users.map((user) => (
                        <Simple
                            key={user.id}
                            username={user.username}
                            followed={user.followed}
                            fullName={user.fullName}
                            bio={user.bio}
                            profilePicture={user.fullImage}
                        />
                    ))}
                </InfiniteScroll>
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
            />
        </div>
    );
}
