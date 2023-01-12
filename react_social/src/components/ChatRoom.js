import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
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

var stompClient = null;
export default function ChatRoom(props) {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [isBlocked, setBlocked] = useState(true);
    const { handle, interaction, id, user } = useParams();
    const [tab, setTab] = useState(handle);
    const [previousMessage, setPreviousMessage] = useState();
    const [currentChat, setCurrentChat] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [userData, setUserData] = useState({
        username: "",
        receivername: "",
        connected: false,
        message: "",
    });
    const [hoverState, setHoverState] = useState({
        sendButtonHover: false,
    });

    const sendButtonStyle = {
        color: isBlocked ? "rgba(134, 63, 217, .5)" : "rgba(134, 63, 217, 1)",
        cursor: hoverState.sendButtonHover
            ? isBlocked
                ? "default"
                : "pointer"
            : "default",
    };

    function handleSendButtonHover() {
        setHoverState((prevState) => {
            return {
                ...prevState,
                sendButtonHover: !prevState.sendButtonHover,
            };
        });
    }

    function handleMessage(event) {
        const { value } = event.target;
        setUserData({ ...userData, message: value });
    }

    useEffect(() => {
        if (userData.message.length > 0) {
            setBlocked(false);
        } else {
            setBlocked(true);
        }
    }, [userData.message]);

    //creates an initial connection to server (registerUser func)
    useEffect(() => {
        if (currentUser != null) {
            setUserData((prevState) => ({
                ...prevState,
                username: currentUser.name,
            }));
            let Sock = new SockJS("http://localhost:8080/ws");
            stompClient = over(Sock);
            stompClient.connect({}, onConnected, onError);
        }
    }, [currentUser]);

    useEffect(() => {
        //this gets all the current conversations
        fetch(`http://localhost:8080/messages/${tab}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setCurrentChat(data);
            })
            .catch((e) => {
                console.log("CAUGHT:", e);
            });
    }, [tab]);

    //function that connects user to the stomp endpoint
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
        fetch(`http://localhost:8080/messages`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
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
        console.log("MESSAGE RECEIVED");
        let payloadData = JSON.parse(payload.body);

        //below just checks if there is already a chat with the users
        //if not one is created
        // if (conversations.includes(payloadData.senderName)) {
        //     privateChats.get(payloadData.senderName).push(payloadData);
        //     setPrivateChats(new Map(privateChats));
        // } else {
        //     let list = [];
        //     list.push(payloadData);

        //     privateChats.set(payloadData.senderName, list);
        //     setPrivateChats(new Map(privateChats));
        // }
        setCurrentChat((prevState) => [...prevState, payloadData]);
    }

    //this function deals with sending messages to a specific person
    function sendPrivateMessage() {
        if (stompClient && !isBlocked) {
            let chatMessage = {
                senderName: currentUser.name,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE",
            };

            //we wont need this if statement because we arent going to allow
            //people to start conversations with themselves
            if (userData.username !== tab) {
                // privateChats.get(tab).push(chatMessage);
                // setPrivateChats(new Map(privateChats));
                setCurrentChat((prevState) => [...prevState, chatMessage]);
            }
            stompClient.send(
                "/app/private-message",
                {},
                JSON.stringify(chatMessage)
            );
            setUserData((prevState) => ({ ...prevState, message: "" }));
        }
    }

    //if you cant connect to the server for some reason
    function onError(err) {
        console.log(err);
    }

    return (
        <div className="chatroom--wrapper">
            <Navbar />
            <div>
                <Header />
                <div className="chatroom--users">
                    <div className="chatroom--arrow">
                        <BsArrowLeftCircleFill />
                    </div>
                    {conversations?.map((chat) => {
                        return (
                            <Avatar
                                conversationWith={chat.conversationWith}
                                tab={tab}
                                id={chat.id}
                                key={chat.id}
                            />
                        );
                    })}
                    <div className="chatroom--arrow">
                        <BsArrowRightCircleFill />
                    </div>
                </div>
                <div className="chatroom">
                    {userData.connected ? (
                        <div className="chatroom--main">
                            {/*this is the specific user chatroom UI logic */}
                            {tab !== "CHATROOM" && (
                                <div className="chatroom--content">
                                    <div className="chatroom--messages">
                                        {currentChat?.map((chat) => (
                                            <div
                                                className={`chatroom--message${
                                                    chat.senderName ===
                                                    currentUser.name
                                                        ? "-self"
                                                        : ""
                                                }`}
                                                key={chat.id}
                                            >
                                                {chat.senderName !==
                                                    currentUser.name && (
                                                    <img
                                                        src="../images/defualt_pic.png"
                                                        className="chatroom--prof-pic"
                                                    ></img>
                                                )}
                                                <div
                                                    className={`chatroom--message-content-wrapper${
                                                        chat.senderName ===
                                                        currentUser.name
                                                            ? "-self"
                                                            : ""
                                                    }`}
                                                >
                                                    <div
                                                        className={`chatroom--message-content${
                                                            chat.senderName ===
                                                            currentUser.name
                                                                ? "-self"
                                                                : ""
                                                        }`}
                                                    >
                                                        {chat.message}
                                                    </div>
                                                    <div className="chatroom--username">
                                                        {chat.senderName}
                                                    </div>
                                                </div>
                                                {chat.senderName ===
                                                    currentUser.name && (
                                                    <img
                                                        src="../images/defualt_pic.png"
                                                        className="chatroom--prof-pic"
                                                    ></img>
                                                )}
                                            </div>
                                        ))}
                                    </div>
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
                <div className="chatroom--sender">
                    <input
                        type="text"
                        className="chatroom--input-box"
                        placeholder="Type here"
                        value={userData.message}
                        onChange={handleMessage}
                        maxLength={200}
                    />
                    <div
                        className="chatroom--send-button"
                        onClick={sendPrivateMessage}
                        style={sendButtonStyle}
                        onMouseEnter={handleSendButtonHover}
                        onMouseLeave={handleSendButtonHover}
                    >
                        <BsCursor />
                    </div>
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
