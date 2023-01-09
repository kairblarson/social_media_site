import { useState, useEffect, useRef } from "react";
import { BsSearch } from "react-icons/bs";
import Extra from "./Extra";
import Navbar from "./Navbar";
import Post from "./Post";
import PostModal from "./PostModal";
import SearchSuggestion from "./SearchSuggestion";
import InfiniteScroll from "react-infinite-scroll-component";
import { ColorRing } from "react-loader-spinner";
import Simple from "./Simple";

export default function Explore(props) {
    const [focused, setFocused] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [postResults, setPostResults] = useState([]);
    const [fullUserList, setFullUserList] = useState([]);
    const [topButtonFocus, setTopButtonFocus] = useState(true);
    const [userButtonFocus, setUserButtonFocus] = useState(false);
    const [postButtonFocus, setPostButtonFocus] = useState(false);
    const [hoverState, setHoverState] = useState({
        userButtonHover: false,
        postButtonHover: false,
        topButtonHover: false,
        searchButtonHover: false,
        viewMoreHover: false,
    });
    const [urlVariable, setUrlVariable] = useState("users");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [initialSearch, setInitialSearch] = useState(false);
    const searchBar = useRef(null);

    useEffect(() => {
        if (!postButtonFocus) {
            fetch(
                `http://localhost:8080/${urlVariable}/search?keyword=${keyword}&page=${page}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    // console.log(data);
                    setSuggestions(data);
                })
                .catch((e) => {
                    console.log("CAUGHT:", e);
                });
            if (keyword.trim() == "") {
                setSuggestions([]);
            }
        }
    }, [keyword]);

    function fetchMoreData() {
        setTimeout(() => {
            setPage((prev) => prev + 1);
        }, 500);
    }

    useEffect(() => {
        if (postResults?.length >= 1) {
            setLoading(false);
        }
    }, [postResults]);

    function submitSearch(e) {
        if (e.keyCode === 13 || e.keyCode === undefined) {
            searchBar.current.blur();
            setInitialSearch(true);
            if (topButtonFocus) {
                fetch(
                    `http://localhost:8080/search?keyword=${keyword}&page=${page}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if (
                            data.postResults?.length <= 0 ||
                            data.postResults?.length >= 200
                        ) {
                            setPostResults([]);
                            setUserResults([]);
                            setHasMore(false);
                        } else {
                            setPostResults(data.postResults);
                            setUserResults(data.userResults);
                        }
                        setLoading(false);
                    })
                    .catch((e) => {
                        console.log("CAUGHT:", e);
                    });
            }
            if (userButtonFocus) {
                fetch(
                    `http://localhost:8080/${urlVariable}/search?keyword=${keyword}&page=${page}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        // console.log(data);
                        setPostResults([]);
                        setUserResults([]);
                        setFullUserList(data);
                        setLoading(false);
                    })
                    .catch((e) => {
                        console.log("CAUGHT:", e);
                    });
            }
            if (postButtonFocus) {
                setUrlVariable("posts");
                fetch(
                    `http://localhost:8080/posts/search?keyword=${keyword}&page=${page}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        // console.log(data);
                        setPostResults(data);
                        setUserResults([]);
                        setFullUserList([]);
                        setLoading(false);
                    })
                    .catch((e) => {
                        console.log("CAUGHT:", e);
                    });
            }
        }
    }

    const inputStyle = {
        borderBlock: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
        borderRight: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
    };

    const iconStyle = {
        borderBlock: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
        borderLeft: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
        color: hoverState.searchButtonHover
            ? "rgba(134, 63, 217, 1)"
            : "#8a8a8a",
        cursor: hoverState.searchButtonHover ? "pointer" : "none",
    };

    const topButtonStyle = {
        color: topButtonFocus ? "black" : "#8a8a8a",
        borderBottom: topButtonFocus
            ? "5px solid rgba(134, 63, 217, .9)"
            : "none",
        background: hoverState.topButtonHover ? "#eae6ed" : "white",
        cursor: hoverState.topButtonHover ? "pointer" : "none",
    };

    const topButtonWrapperStyle = {
        background: hoverState.topButtonHover ? "#eae6ed" : "white",
        cursor: hoverState.topButtonHover ? "pointer" : "none",
    };

    const userButtonStyle = {
        color: userButtonFocus ? "black" : "#8a8a8a",
        borderBottom: userButtonFocus
            ? "5px solid rgba(134, 63, 217, .9)"
            : "none",
        background: hoverState.userButtonHover ? "#eae6ed" : "white",
        cursor: hoverState.userButtonHover ? "pointer" : "none",
    };

    const userButtonWrapperStyle = {
        background: hoverState.userButtonHover ? "#eae6ed" : "white",
        cursor: hoverState.userButtonHover ? "pointer" : "none",
    };

    const postButtonStyle = {
        color: postButtonFocus ? "black" : "#8a8a8a",
        borderBottom: postButtonFocus
            ? "5px solid rgba(134, 63, 217, .9)"
            : "none",
        background: hoverState.postButtonHover ? "#eae6ed" : "white",
        cursor: hoverState.postButtonHover ? "pointer" : "none",
    };

    const postButtonWrapperStyle = {
        background: hoverState.postButtonHover ? "#eae6ed" : "white",
        cursor: hoverState.postButtonHover ? "pointer" : "none",
    };

    const viewMoreStyle = {
        textDecoration: hoverState.viewMoreHover ? "underline" : "none",
        cursor: hoverState.viewMoreHover ? "pointer" : "none",
    };

    function handleTopButtonHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                topButtonHover: !prevState.topButtonHover,
            };
        });
    }

    function handleUserButtonHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                userButtonHover: !prevState.userButtonHover,
            };
        });
    }

    function handlePostButtonHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                postButtonHover: !prevState.postButtonHover,
            };
        });
    }

    function handleSearchButtonHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                searchButtonHover: !prevState.searchButtonHover,
            };
        });
    }

    function handleViewMoreHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                viewMoreHover: !prevState.viewMoreHover,
            };
        });
    }

    function handleTopButtonClick() {
        setTopButtonFocus(true);
        setUserButtonFocus(false);
        setPostButtonFocus(false);
        setUrlVariable("users");
        setSuggestions(null);
        setPostResults([]);
        setUserResults([]);
        setFullUserList([]);
        // setKeyword("");
    }

    function handleUserButtonClick() {
        setTopButtonFocus(false);
        setUserButtonFocus(true);
        setPostButtonFocus(false);
        setUrlVariable("users");
        setSuggestions(null);
        setPostResults([]);
        setUserResults([]);
        setFullUserList([]);
        // setKeyword("");
    }

    function handlePostButtonClick() {
        setTopButtonFocus(false);
        setUserButtonFocus(false);
        setPostButtonFocus(true);
        setUrlVariable(null);
        setSuggestions(null);
        setPostResults([]);
        setUserResults([]);
        setFullUserList([]);
        // setKeyword("");
    }

    function handleFocus() {
        setTimeout(() => {
            setFocused((prevState) => !prevState);
        }, 100);
    }

    function handleChange(e) {
        const { value } = e.target;
        setKeyword(value);
    }

    function handleClick(username) {
        window.location = `http://localhost:3000/${username}`;
    }

    function handleMenuToggle(id) {
        setSuggestions((prevState) => {
            return prevState.map((post) => {
                return id == post.id
                    ? { ...post, menuState: true }
                    : { ...post, menuState: false };
            });
        });
    }

    const sugElement = suggestions?.map((res) => {
        if (urlVariable == "users") {
            return (
                <SearchSuggestion
                    key={res.id}
                    username={res.username}
                    fullName={res.fullName}
                    bio={res.bio}
                    profilePicture={res.fullImage}
                    handleClick={handleClick}
                ></SearchSuggestion>
            );
        }
    });

    const userResElement = userResults?.map((user) => {
        return (
            <Simple
                key={user.id}
                fullName={user.fullName}
                username={user.username}
                profilePicture={user.fullImage}
                bio={user.bio}
                followed={user.followed}
            />
        );
    });

    const fullUserListElement = fullUserList?.map((user) => {
        return (
            <Simple
                key={user.id}
                fullName={user.fullName}
                username={user.username}
                profilePicture={user.fullImage}
                bio={user.bio}
                followed={user.followed}
            />
        );
    });

    const postResElement = postResults?.map((res) => {
        const replyTo =
            res.replyTo == null ? null : res.replyTo.author.username;
        return (
            <Post
                key={res.id}
                id={res.id}
                content={res.content}
                author={res.author}
                postDate={res.postDate}
                likes={res.likes}
                isLiked={res.liked}
                reposts={res.reposts}
                isReposted={res.reposted}
                repostedBy={res.repostedBy}
                replyTo={replyTo}
                comments={res.comments}
                modalState={props.modalState}
                openModal={props.openModal}
                isAuth={props.isAuth}
                isHome={true}
                profilePicture={res.profPicBytes}
                menuState={res.menuState}
                handleMenuToggle={handleMenuToggle}
            />
        );
    });

    return (
        <div className="explore--wrapper">
            <Navbar />
            <div className="explore">
                <div className="explore--top">
                    <div className="explore--searchbar-wrapper">
                        <div
                            className="explore--icon"
                            style={iconStyle}
                            onClick={submitSearch}
                            onMouseEnter={handleSearchButtonHover}
                            onMouseLeave={handleSearchButtonHover}
                        >
                            <BsSearch />
                        </div>
                        <input
                            type="text"
                            className="explore--searchbar"
                            placeholder="Search Termite"
                            onFocus={handleFocus}
                            onBlur={handleFocus}
                            style={inputStyle}
                            onChange={handleChange}
                            value={keyword}
                            onKeyDown={submitSearch}
                            ref={searchBar}
                        ></input>
                    </div>
                    {focused && (
                        <div className="searchsuggestion--wrapper">
                            {sugElement}
                        </div>
                    )}
                </div>
                <div className="explore--options">
                    <div
                        className="explore--button-wrapper"
                        onMouseEnter={handleTopButtonHover}
                        onMouseLeave={handleTopButtonHover}
                        style={topButtonWrapperStyle}
                        onClick={handleTopButtonClick}
                    >
                        <button
                            className="explore--button"
                            style={topButtonStyle}
                            onClick={handleTopButtonClick}
                        >
                            Top
                        </button>
                    </div>
                    <div
                        className="explore--button-wrapper"
                        onMouseEnter={handleUserButtonHover}
                        onMouseLeave={handleUserButtonHover}
                        style={userButtonWrapperStyle}
                        onClick={handleUserButtonClick}
                    >
                        <button
                            className="explore--button"
                            style={userButtonStyle}
                            onClick={handleUserButtonClick}
                        >
                            Users
                        </button>
                    </div>
                    <div
                        className="explore--button-wrapper"
                        onMouseEnter={handlePostButtonHover}
                        onMouseLeave={handlePostButtonHover}
                        style={postButtonWrapperStyle}
                        onClick={handlePostButtonClick}
                    >
                        <button
                            className="explore--button"
                            style={postButtonStyle}
                            onClick={handlePostButtonClick}
                        >
                            Posts
                        </button>
                    </div>
                </div>
                {!loading &&
                    !postButtonFocus &&
                    userResults?.length != 0 &&
                    userResults?.length != undefined && (
                        <div className="explore--userres">
                            <h4 className="explore--userres-title">Users</h4>
                            {userResElement}
                            <div
                                className="explore--userres-more"
                                style={viewMoreStyle}
                                onMouseEnter={handleViewMoreHover}
                                onMouseLeave={handleViewMoreHover}
                                onClick={() => {
                                    handleUserButtonClick();
                                    submitSearch();
                                }}
                            >
                                View more
                            </div>
                        </div>
                    )}
                {!loading && !postButtonFocus && fullUserList.length != 0 && (
                    <div className="explore--full-user-list">
                        {fullUserListElement}
                    </div>
                )}
                {loading ? (
                    initialSearch && (
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
                    )
                ) : (
                    <div className="explore--postres">{postResElement}</div>
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
