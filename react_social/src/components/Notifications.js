import { useState, useEffect } from "react";
import Extra from "./Extra";
import Header from "./Header";
import Navbar from "./Navbar";
import Notif from "./Notif";
import PostModal from "./PostModal";
import InfiniteScroll from "react-infinite-scroll-component";
import { ColorRing } from "react-loader-spinner";

//nav done
export default function Notifications(props) {
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_BASE_URL}/get-notifications?exact=true&page=${page}`,
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
                    // console.log(data);
                    setNotifications((prev) => {
                        return [...prev, ...data];
                    });
                }
                setLoading(false);
            });
    }, [page]);

    function fetchMoreData() {
        setTimeout(() => {
            setPage((prev) => prev + 1);
        }, 500);
    }

    return (
        <div className="notifications">
            <Navbar />
            <div>
                <Header />
                <div className="notifications--middle">
                    {/*might need to put another div around the map*/}
                    {loading ? (
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
                        <InfiniteScroll
                            dataLength={notifications.length}
                            style={{ overflow: "hidden" }}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            endMessage={null}
                        >
                            {notifications?.map((notif) => {
                                return (
                                    <Notif
                                        key={notif.id}
                                        id={notif.id}
                                        action={notif.action}
                                        content={notif.content}
                                        from={notif.from}
                                        date={notif.notificationDate}
                                        ppCDNLink={notif.from.ppCDNLink}
                                        comment={notif.comment}
                                    />
                                );
                            })}
                        </InfiniteScroll>
                    )}
                </div>
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
