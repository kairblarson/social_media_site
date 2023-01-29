import { Link, useNavigate } from "react-router-dom";
import Post from "./Post";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Header from "./Header";
import { ColorRing } from "react-loader-spinner";

//nav done //local done
export default function Timeline(props) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_BASE_URL}/request-timeline?page=${page}`,
            {
                method: "GET",
                credentials: "include",
            }
        )
            .then((res) => {
                if (res.status === 400) {
                    localStorage.setItem("userDetails", null);
                    navigate("/login");
                }
                return res.json();
            })
            .then((data) => {
                if (data.length <= 0 || data.length >= 200) {
                    setHasMore(false);
                } else {
                    setPosts((prev) => {
                        return [...prev, ...data];
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                navigate("/login");
            });
    }, [page]);

    function fetchMoreData() {
        setTimeout(() => {
            setPage((prev) => prev + 1);
        }, 500);
    }

    function handleMenuToggle(id) {
        setPosts((prevState) => {
            return prevState.map((post) => {
                return id == post.id
                    ? { ...post, menuState: true }
                    : { ...post, menuState: false };
            });
        });
    }

    console.log(props.update);

    return (
        <div>
            <InfiniteScroll
                dataLength={posts.length}
                className="timeline"
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
                {posts.map((post) => {
                    const replyTo =
                        post.replyTo == null
                            ? null
                            : post.replyTo.author.username;
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
                            openModal={props.openModal}
                            isAuth={props.isAuth}
                            isHome={true}
                            profilePicture={post.profPicBytes}
                            menuState={post.menuState}
                            handleMenuToggle={handleMenuToggle}
                            ppCDNLink={post.ppCDNLink}
                        />
                    );
                })}
            </InfiniteScroll>
        </div>
    );
}
//say what tab youre on at the top & highlight the button of the current page
