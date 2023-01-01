import { useState, useEffect } from "react";
import Extra from "./Extra";
import Header from "./Header";
import Navbar from "./Navbar";
import Notif from "./Notif";
import PostModal from "./PostModal";

export default function Notifications(props) {
    const [notifications, setNotifications] = useState();

    useEffect(() => {
        fetch("http://localhost:8080/get-notifications?exact=true", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setNotifications(data);
            });
        //maybe make this api call in the app component and pass it down through props
    }, []);

    return (
        <div className="notifications">
            <Navbar />
            <div>
                <Header />
                <div className="notifications--middle">
                    {/*might need to put another div around the map*/}
                    {notifications?.map((notif) => {
                        return (
                            <Notif
                                key={notif.id}
                                id={notif.id}
                                action={notif.action}
                                content={notif.content}
                                from={notif.from}
                                date={notif.notificationDate}
                            />
                        );
                    })}
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
