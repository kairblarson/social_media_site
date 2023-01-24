import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import PostModal from "./PostModal";
import Extra from "./Extra";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import {
    BsArrow90DegRight,
    BsArrowLeftCircleFill,
    BsArrowRightCircleFill,
    BsBoxArrowInLeft,
    BsCursor,
} from "react-icons/bs";
import Header from "./Header";
import Avatar from "./Avatar";
import { ColorRing } from "react-loader-spinner";
import Message from "./Message";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Sender from "./Sender";
import { useUnmountEffect } from "framer-motion";

//nav done //local done
var stompClient = null;
export default function ChatRoom(props) {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const currentLocation = useLocation();
    const { handle, interaction, id, user } = useParams();
    const [tab, setTab] = useState("");
    const [currentChat, setCurrentChat] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [userData, setUserData] = useState({
        username: "",
        receivername: "",
        connected: false,
        message: "",
    });
    const [hoverState, setHoverState] = useState({
        backHover: false,
        forwardHover: false,
    });
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const chatRoomRef = useRef();
    let previousMessage = {};
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isNewChat, setIsNewChat] = useState(false);

    useEffect(() => {
        setTab(window.location.pathname.substring(10));
    }, [window.location.pathname]);

    //creates an initial connection to server (registerUser func)
    useEffect(() => {
        if (currentUser != null) {
            setUserData((prevState) => ({
                ...prevState,
                username: currentUser.name,
            }));
            let Sock = new SockJS(`${process.env.REACT_APP_BASE_URL}/ws`);
            stompClient = over(Sock);
            stompClient.connect({}, onConnected, onError);
        }
    }, [currentUser]);

    useEffect(() => {
        //this gets all the current conversations
        if (tab !== "") {
            fetch(`${process.env.REACT_APP_BASE_URL}/messages/${tab}?page=${page}`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log(data);
                    if (data.length <= 0 || data.length >= 200) {
                        setHasMore(false);
                    } else {
                        setCurrentChat((prev) => {
                            return [...prev, ...data];
                        });
                    }
                    setLoading(false);
                })
                .catch((e) => {
                    console.log("CAUGHT:", e);
                });
        }
    }, [tab, page]);

    function fetchMoreData() {
        console.log("FETCH MORE");
        setTimeout(() => {
            setPage((prev) => prev + 1);
        }, 500);
    }

    //function that connects user to the stomp endpoint
    //prop
    function onConnected() {
        setUserData({ ...userData, connected: true });
        //this is the endpoint for our user that we are listening to for messages
        stompClient.subscribe(
            "/user/" + currentUser.name + "/private",
            onPrivateMessageReceived
        );
        userJoin();
    }

    //this function lets the server that a user has joined the server and
    //that in turn sets another user to be created in the chat rooms area
    function userJoin() {
        let chatMessage = {
            senderName: currentUser.name,
            status: "JOIN",
        };
        fetch(
            `${process.env.REACT_APP_BASE_URL}/messages?target=${
                handle === undefined ? "" : handle
            }`,
            {
                method: "GET",
                credentials: "include",
            }
        )
            .then((res) => res.json())
            .then((data) => {
                // console.log(data);
                let chat = [];
                data.forEach((message) => {
                    if (!chat.includes(message.conversationWith)) {
                        chat.push(message.conversationWith);
                        setConversations((prevState) => [
                            ...prevState,
                            message,
                        ]);
                    }
                });
                setLoading(false);
            })
            .catch((e) => {
                console.log("CAUGHT:", e);
            });
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    useEffect(() => {
        if (conversations.length > 0) {
            if (
                handle == null ||
                conversations.some((convo) => convo.conversationWith === handle)
            ) {
            } else {
                const startChat = {
                    conversationWith: handle,
                    profilePicture: null,
                };
                setConversations((prevState) => [...prevState, startChat]);
            }
        }
    }, [conversations]);

    //this is more important in our use case
    function onPrivateMessageReceived(payload) {
        let payloadData = JSON.parse(payload.body);
        if (currentLocation.pathname != "/messages") {
            setCurrentChat((prevState) => [payloadData, ...prevState]);
        }
    }

    function sendPrivateMessage(content, isBlocked) {
        if (stompClient && !isBlocked) {
            let chatMessage = {
                senderName: currentUser.name,
                receiverName: tab,
                message: content,
                messageDate: new Date().getTime(),
                ppCDNLink: null,
                status: "MESSAGE",
            };

            stompClient.send(
                "/app/private-message",
                {},
                JSON.stringify(chatMessage)
            );

            chatMessage.ppCDNLink = currentUser.principal.ppCDNLink;

            if (userData.username !== tab) {
                setCurrentChat((prevState) => [chatMessage, ...prevState]);
            }
        }
    }

    console.log(currentChat);

    //if you cant connect to the server for some reason
    function onError(err) {
        console.log(err);
    }

    //new
    function carouselInfiniteScroll(direction) {
        if (currentIndex < 0) {
            console.log("HERE??");
            return setCurrentIndex(0);
        }
        if (direction === "L" && currentIndex > 0) {
            return setCurrentIndex(currentIndex - 1);
        }
        if (direction === "R" && currentIndex < conversations.length - 1) {
            console.log("IS IT GOING HERE?");
            return setCurrentIndex(currentIndex + 1);
        }
        return setCurrentIndex(currentIndex);
    }

    const [scrollHeight, setScrollHeight] = useState(null);

    useEffect(() => {
        setScrollHeight(window.innerHeight);
        chatRoomRef?.current?.scrollTo(0, chatRoomRef.current.scrollHeight);
    }, [currentChat, chatRoomRef?.current?.clientHeight]);

    useUnmountEffect(() => {
        document.body.style.overflowY = "auto";
    });

    document.body.style.overflowY = "hidden";

    const forwardButtonStyle = {
        color: hoverState.forwardHover ? "rgba(0,0,0,0.8)" : "black",
        cursor: hoverState.forwardHover ? "pointer" : "default",
    };

    const backButtonStyle = {
        color: hoverState.backHover ? "rgba(0,0,0,0.8)" : "black",
        cursor: hoverState.backHover ? "pointer" : "default",
    };

    function handleForwardHover() {
        setHoverState((prevState) => {
            return { ...prevState, forwardHover: !prevState.forwardHover };
        });
    }

    function handleBackHover() {
        setHoverState((prevState) => {
            return { ...prevState, backHover: !prevState.backHover };
        });
    }

    return (
        <div className="chatroom--wrapper">
            <Navbar />
            <div>
                <Header />
                {!loading && (
                    <div className="chatroom--carousel-wrapper">
                        <div className="chatroom--arrow">
                            <BsArrowLeftCircleFill
                                onClick={() => carouselInfiniteScroll("L")}
                                style={backButtonStyle}
                                onMouseEnter={handleBackHover}
                                onMouseLeave={handleBackHover}
                            />
                        </div>
                        <div className="chatroom--carousel">
                            {conversations?.map((chat, index) => {
                                let viewed = chat.viewed;
                                if (handle === chat.senderName) {
                                    viewed = true;
                                }
                                return (
                                    <Avatar
                                        conversationWith={chat.conversationWith}
                                        tab={tab}
                                        id={chat.id}
                                        key={chat.id}
                                        profilePicture={chat.profilePicture}
                                        viewed={viewed}
                                        senderName={chat.senderName}
                                        currentUser={currentUser}
                                        index={index}
                                        currentIndex={currentIndex}
                                        setCurrentChat={setCurrentChat}
                                        ppCDNLink={chat.ppCDNLink}
                                    />
                                );
                            })}
                        </div>
                        <div className="chatroom--arrow">
                            <BsArrowRightCircleFill
                                onClick={() => carouselInfiniteScroll("R")}
                                style={forwardButtonStyle}
                                onMouseEnter={handleForwardHover}
                                onMouseLeave={handleForwardHover}
                            />
                        </div>
                    </div>
                )}
                <div className="chatroom">
                    {userData.connected ? (
                        <div className="chatroom--main">
                            {/*this is the specific user chatroom UI logic */}
                            {tab !== "CHATROOM" && (
                                <div
                                    className="chatroom--content"
                                    ref={chatRoomRef}
                                >
                                    {!loading ? (
                                        tab != "" && (
                                            <div>
                                                <InfiniteScroll
                                                    dataLength={
                                                        currentChat.length
                                                    }
                                                    next={fetchMoreData}
                                                    hasMore={hasMore}
                                                    style={{
                                                        display: "flex",
                                                        flexDirection:
                                                            "column-reverse",
                                                    }}
                                                    inverse={true}
                                                    height={scrollHeight - 210}
                                                    loader={
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                justifyContent:
                                                                    "center",
                                                                marginBottom:
                                                                    "400px",
                                                            }}
                                                        >
                                                            <BeatLoader
                                                                color="rgba(134, 63, 217, 1)"
                                                                size={10}
                                                            ></BeatLoader>
                                                        </div>
                                                    }
                                                >
                                                    {currentChat?.map(
                                                        (chat, index) => {
                                                            let backToBack = false;
                                                            if (
                                                                chat.senderName ===
                                                                previousMessage?.senderName
                                                            ) {
                                                                if (
                                                                    chat.messageDate +
                                                                        300000 >
                                                                    previousMessage.messageDate
                                                                ) {
                                                                    backToBack = true;
                                                                }
                                                            }
                                                            previousMessage =
                                                                chat;
                                                            return (
                                                                <Message
                                                                    key={index}
                                                                    message={
                                                                        chat.message
                                                                    }
                                                                    senderName={
                                                                        chat.senderName
                                                                    }
                                                                    profilePicture={
                                                                        chat.profilePicture
                                                                    }
                                                                    backToBack={
                                                                        backToBack
                                                                    }
                                                                    date={
                                                                        chat.messageDate
                                                                    }
                                                                    viewed={
                                                                        chat.viewed
                                                                    }
                                                                    ppCDNLink={chat.ppCDNLink}
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </InfiniteScroll>
                                            </div>
                                        )
                                    ) : (
                                        <div className="chatroom--spinner">
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
                            )}
                        </div>
                    ) : (
                        <div className="chatroom--register">
                            {/*have a loading spinner here instead*/}
                        </div>
                    )}
                </div>
                {/*send private message UI *IMPORTANT* */}
                {tab != "" && (
                    <Sender sendPrivateMessage={sendPrivateMessage} />
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
