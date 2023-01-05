import { useState, useEffect } from "react";
import { BsSearch } from "react-icons/bs";
import Extra from "./Extra";
import Navbar from "./Navbar";
import Post from "./Post";
import PostModal from "./PostModal";
import SearchSuggestion from "./SearchSuggestion";
import InfiniteScroll from "react-infinite-scroll-component";
import { ColorRing } from "react-loader-spinner";

export default function Explore(props) {
    const [focused, setFocused] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [userButtonFocus, setUserButtonFocus] = useState(true);
    const [postButtonFocus, setPostButtonFocus] = useState(false);
    const [hoverState, setHoverState] = useState({
        userButtonHover: false,
        postButtonHover: false,
    });
    const [urlVariable, setUrlVariable] = useState("users");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(
            `http://localhost:8080/${urlVariable}/search?keyword=${keyword}&page=${page}`,
            {
                method: "GET",
                credentials: "include",
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.length <= 0 || data.length >= 200) {
                    setHasMore(false);
                } else {
                    console.log(data);
                    setResults((prev) => {
                        return [...data];
                    });
                }
            })
            .catch((e) => {
                console.log("CAUGHT:", e);
            });
        if(keyword.trim() == "") {
            setResults([]);
        }
    }, [keyword]);

    useEffect(() => {
        if(results?.length >= 1) {
            setLoading(false);
        }
    }, [results]);

    const inputStyle = {
        borderBlock: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
        borderRight: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
    };

    const iconStyle = {
        borderBlock: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
        borderLeft: focused ? "1px solid rgba(134, 63, 217, .9)" : "none",
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

    const resultsStyle = {
        background: urlVariable == "posts" ? "none" : "white",
        boxShadow:
            urlVariable == "posts" ? "none" : "0 0 5px rgba(77, 49, 102, 0.3)",
    };

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

    function handleUserButtonClick() {
        setUserButtonFocus(true);
        setPostButtonFocus(false);
        setUrlVariable("users");
        setResults(null);
        setKeyword("");
    }

    function handlePostButtonClick() {
        setUserButtonFocus(false);
        setPostButtonFocus(true);
        setUrlVariable("posts");
        setResults(null);
        setKeyword("");
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

    const resElement = results?.map((res) => {
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
        } else {
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
        }
    });

    function handleMenuToggle(id) {
        setResults((prevState) => {
            return prevState.map((post) => {
                return id == post.id
                    ? { ...post, menuState: true }
                    : { ...post, menuState: false };
            });
        });
    }

    function fetchMoreData() {
        setTimeout(() => {
            setPage((prev) => prev + 1);
        }, 500);
    }

    // console.log(results);

    return (
        <div className="explore--wrapper">
            <Navbar />
            <div className="explore">
                <div className="explore--top">
                    <div className="explore--icon" style={iconStyle}>
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
                    ></input>
                </div>
                <div className="explore--options">
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
                {loading ? keyword != "" && (
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
                ) : (
                    <div
                        className="searchsuggestion--wrapper"
                        style={resultsStyle}
                    >
                        <InfiniteScroll
                            dataLength={results?.length}
                            className=""
                            style={{ overflow: "hidden" }}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            endMessage={null}
                        >
                            {resElement}
                        </InfiniteScroll>
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
