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

export default function App() {
    const [modalState, setModalState] = useState(false);
    const [editModalState, setEditModalState] = useState(false);
    const [isAuth, setIsAuth] = useState();
    const [targetPost, setTargetPost] = useState();
    const { handle, id, interaction } = useParams();

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
        console.log(modalState);
        document.body.style.overflowY =
            modalState || editModalState ? "hidden" : "auto";
    }, [modalState, editModalState]);

    function handleSubmit(content) {
        console.log("POSTED", content);
        axios({
            url: `http://localhost:8080/process-post${
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
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
        window.location = `http://localhost:3000/home`;
    }

    useEffect(() => {
        axios({
            url: `http://localhost:8080/isAuth`,
            withCredentials: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    console.log("AUTH");
                    setIsAuth(true);
                } else {
                    console.log("NOT AUTH");
                    setIsAuth(false);
                    localStorage.setItem("userDetails", null);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    //make api call on startup to check if logged in with every request

    return (
        <div className="app">
            <UserContextProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
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
                            path=":handle/likes"
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
                        </Route>
                    </Routes>
                </Router>
            </UserContextProvider>
        </div>
    );
}

//notice how you wrapped everything in the UserContextProvider component
