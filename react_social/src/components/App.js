import { useState, useEffect, createContext } from "react";
import Home from "../components/Home";
import Login from "../components/Login";
import {
    Route,
    Routes,
    BrowserRouter as Router,
    useParams,
} from "react-router-dom";
import Profile from "../components/Profile";
import ProtectedRoutes, { useAuth } from "./ProtectedRoutes";
import { UserContextProvider } from "./UserContext";
import axios from "axios";
import UserList from "../components/UserList";
import FullPost from "./FullPost";
import Notifications from "./Notifications";
import Explore from "./Explore";
import ChatRoom from "./ChatRoom";
import SignupPage from "./SignupPage";

//nav done //local done
export default function App() {
    const [modalState, setModalState] = useState(false);
    const [editModalState, setEditModalState] = useState(false);
    const [isAuth, setIsAuth] = useState();
    const [targetPost, setTargetPost] = useState();
    const { handle, id, interaction } = useParams();
    const [update, toggleUpdate] = useState(true);

    function toggleModal(post) {
        setTargetPost(post);
        setModalState((prevState) => {
            return !prevState;
        });
    }

    function toggleEdit(e) {
        setEditModalState((prevState) => !prevState);
    }

    useEffect(() => {
        document.body.style.overflowY =
            modalState || editModalState ? "hidden" : "auto";
    }, [modalState, editModalState]);

    function handleSubmit(content) {
        console.log("POST", content);
        console.log(`BASE URL: ${process.env.REACT_APP_BASE_URL}`)
        axios({
            url: `${process.env.REACT_APP_BASE_URL}/process-post${
                targetPost != null ? `?targetId=${targetPost.id}` : ""
            }`,
            withCredentials: true,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            data: content,
        })
            .then((res) => {
                console.log("RES",res.data);
                console.log("RES 2: ",res.status);
            })
            .catch((err) => {
                console.log("ERROR: ",err);
            });
        toggleModal(false);
    }

    useEffect(() => {
        axios({
            url: `${process.env.REACT_APP_BASE_URL}/isAuth`,
            withCredentials: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    // console.log("AUTH");
                    setIsAuth(true);
                } else {
                    // console.log("NOT AUTH");
                    setIsAuth(false);
                    localStorage.setItem("userDetails", null);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [update]);

    function handleToggleUpdate() {
        toggleUpdate((prev) => !prev);
    }

    return (
        <div className="app">
            <UserContextProvider>
                <Router>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <Login
                                    handleToggleUpdate={handleToggleUpdate}
                                />
                            }
                        />
                        <Route
                            path=":handle"
                            element={
                                <Profile
                                    toggleModal={toggleModal}
                                    modalState={modalState}
                                    handleSubmit={handleSubmit}
                                    isAuth={isAuth}
                                    targetPost={targetPost}
                                    toggleEdit={toggleEdit}
                                    editModalState={editModalState}
                                />
                            }
                        />
                        <Route
                            path=":handle/:interaction"
                            element={
                                <Profile
                                    toggleModal={toggleModal}
                                    modalState={modalState}
                                    handleSubmit={handleSubmit}
                                    isAuth={isAuth}
                                    targetPost={targetPost}
                                    toggleEdit={toggleEdit}
                                    editModalState={editModalState}
                                    key={interaction}
                                />
                            }
                        />
                        <Route
                            path=":handle/post/:id"
                            element={
                                <FullPost
                                    toggleModal={toggleModal}
                                    modalState={modalState}
                                    handleSubmit={handleSubmit}
                                    isAuth={isAuth}
                                    targetPost={targetPost}
                                />
                            }
                        />
                        <Route
                            path=":handle/post/:id/:interaction"
                            element={
                                <UserList
                                    toggleModal={toggleModal}
                                    modalState={modalState}
                                    handleSubmit={handleSubmit}
                                    isAuth={isAuth}
                                    targetPost={targetPost}
                                    interaction={interaction}
                                />
                            }
                        />
                        <Route
                            path="/explore"
                            element={
                                <Explore
                                    toggleModal={toggleModal}
                                    modalState={modalState}
                                    handleSubmit={handleSubmit}
                                    isAuth={isAuth}
                                    targetPost={targetPost}
                                    interaction={interaction}
                                />
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <SignupPage
                                    handleToggleUpdate={handleToggleUpdate}
                                />
                            }
                        />
                        <Route element={<ProtectedRoutes />}>
                            <Route
                                path="/"
                                element={
                                    <Home
                                        toggleModal={toggleModal}
                                        modalState={modalState}
                                        handleSubmit={handleSubmit}
                                        isAuth={isAuth}
                                        targetPost={targetPost}
                                    />
                                }
                            />
                            <Route
                                path="/home"
                                element={
                                    <Home
                                        toggleModal={toggleModal}
                                        modalState={modalState}
                                        handleSubmit={handleSubmit}
                                        isAuth={isAuth}
                                        targetPost={targetPost}
                                    />
                                }
                            />
                            <Route
                                path=":handle/followers"
                                element={
                                    <UserList
                                        toggleModal={toggleModal}
                                        modalState={modalState}
                                        handleSubmit={handleSubmit}
                                        isAuth={isAuth}
                                        targetPost={targetPost}
                                    />
                                }
                            />
                            <Route
                                path=":handle/following"
                                element={
                                    <UserList
                                        toggleModal={toggleModal}
                                        modalState={modalState}
                                        handleSubmit={handleSubmit}
                                        isAuth={isAuth}
                                        targetPost={targetPost}
                                    />
                                }
                            />
                            <Route
                                path=":handle/notifications"
                                element={
                                    <Notifications
                                        toggleModal={toggleModal}
                                        modalState={modalState}
                                        handleSubmit={handleSubmit}
                                        isAuth={isAuth}
                                        targetPost={targetPost}
                                    />
                                }
                            />
                            <Route
                                path="/messages/:handle"
                                element={
                                    <ChatRoom
                                        toggleModal={toggleModal}
                                        modalState={modalState}
                                        handleSubmit={handleSubmit}
                                        isAuth={isAuth}
                                        targetPost={targetPost}
                                    />
                                }
                            />
                            <Route
                                path="/messages"
                                element={
                                    <ChatRoom
                                        toggleModal={toggleModal}
                                        modalState={modalState}
                                        handleSubmit={handleSubmit}
                                        isAuth={isAuth}
                                        targetPost={targetPost}
                                    />
                                }
                            />
                        </Route>
                    </Routes>
                </Router>
            </UserContextProvider>
        </div>
    );
}
