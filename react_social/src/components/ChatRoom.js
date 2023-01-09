import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import PostModal from "./PostModal";
import Extra from "./Extra";
import { over } from "stompjs";
import SockJS from "sockjs-client";

var stompClient = null;
export default function ChatRoom(props) {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    //this just holds the existing chat messages
    const [publicChats, setPublicChats] = useState([]);
    //holds {username} and {user messages} in a map
    const [privateChats, setPrivateChats] = useState(new Map());
    const [tab, setTab] = useState("CHATROOM");
    const [previousMessage, setPreviousMessage] = useState();
    const [currentMessages, setCurrentMessages] = useState();
    const [userData, setUserData] = useState({
        username: "",
        receivername: "",
        connected: false,
        message: "",
    });

    function handleMessage(event) {
        const { value } = event.target;
        setUserData({ ...userData, message: value });
        //this changes the value of the message data
    }

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

    //function that connects user to the stomp endpoint
    function onConnected() {
        setUserData({ ...userData, connected: true });
        //this is the public endpoint that we are listening to from the backend
        stompClient.subscribe("/chatroom/public", onPublicMessageReceived);
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
            `http://localhost:8080/messages/wallen7`,
            {
                method: "GET",
                credentials: "include",
            }
        )
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            })
            .catch((e) => {
                console.log("CAUGHT:", e);
            });
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    //function that handles public stomp messages that are received from server
    //we wont have a public messaging service so this isnt important
    function onPublicMessageReceived(payload) {
        let payloadData = JSON.parse(payload.body);

        //below is maybe not as important for our usecase because we are only
        //going to track if a user has received a new message
        switch (payloadData.status) {
            case "JOIN":
                //if someone joins and you dont have a previous chat with them
                //thier username will pop and a blank session will be created
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                //this ques the previous messages and serves them up
                //this will most likely be done on the backend tho
                //this strategy does not persist data
                setPublicChats((prevState) => {
                    console.log(payloadData);
                    return [...prevState, payloadData];
                });
                break;
            case "LEAVE":
                break;
        }
    }

    //this is more important in our use case
    function onPrivateMessageReceived(payload) {
        console.log("MESSAGE RECEIVED");
        let payloadData = JSON.parse(payload.body);

        //below just checks if there is already a chat with the users
        //if not one is created
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);

            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    }

    //obv this function deals with sending messages to the public endpoint
    function sendPublicMessage() {
        if (stompClient) {
            let chatMessage = {
                senderName: currentUser.name,
                receiverName: "PUBLIC",
                message: userData.message,
                status: "MESSAGE",
            };
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData((prevState) => ({ ...prevState, message: "" }));
        }
    }

    //this function deals with sending messages to a specific person
    function sendPrivateMessage() {
        if (stompClient) {
            let chatMessage = {
                senderName: currentUser.name,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE",
            };

            if (userData.username !== tab) {
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
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
            <div className="chatroom">
                {userData.connected ? (
                    <div className="chatroom--main">
                        <div>
                            <div className="chatroom--users">
                                <div
                                    onClick={() => setTab("CHATROOM")}
                                    className={`chatroom--member${
                                        tab === "CHATROOM" ? "-active" : ""
                                    }`}
                                >
                                    Chatroom
                                </div>
                                {[...privateChats.keys()].map(
                                    (username, index) => (
                                        <div
                                            className={`chatroom--member${
                                                tab === username
                                                    ? "-active"
                                                    : ""
                                            }`}
                                            key={index}
                                            onClick={() => setTab(username)}
                                        >
                                            <img
                                                src="../images/defualt_pic.png"
                                                className="chatroom--member-pic"
                                            ></img>
                                            {username}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        {/*this is the public chatroom UI logic */}
                        {tab === "CHATROOM" && (
                            <div className="chatroom--content">
                                <div className="chatroom--messages">
                                    {publicChats.map((chat, index) => (
                                        <div
                                            className={`chatroom--message${
                                                chat.senderName ===
                                                currentUser.name
                                                    ? "-self"
                                                    : ""
                                            }`}
                                            key={index}
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

                                {/*send public message UI */}
                                <div className="chatroom--sender">
                                    <input
                                        type="text"
                                        className="chatroom--input-message"
                                        placeholder="Create new message"
                                        value={userData.message}
                                        onChange={handleMessage}
                                    />
                                    <button
                                        className="chatroom--send-button"
                                        onClick={sendPublicMessage}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}
                        {/*this is the specific user chatroom UI logic */}
                        {tab !== "CHATROOM" && (
                            <div className="chatroom--content">
                                <div className="chatroom--messages">
                                    {[...privateChats.get(tab)].map(
                                        (chat, index) => (
                                            <div
                                                className={`chatroom--message${
                                                    chat.senderName ===
                                                    currentUser.name
                                                        ? "-self"
                                                        : ""
                                                }`}
                                                key={index}
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
                                        )
                                    )}
                                </div>

                                {/*send private message UI *IMPORTANT* */}
                                <div className="chatroom--sender">
                                    <input
                                        type="text"
                                        className="chatroom--input-message"
                                        placeholder="Type here"
                                        value={userData.message}
                                        onChange={handleMessage}
                                    />
                                    <button
                                        className="chatroom--send-button"
                                        onClick={sendPrivateMessage}
                                    >
                                        Send
                                    </button>
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
