import { useState, useEffect } from "react";
import {
    BsFillXCircleFill,
    BsFillXSquareFill,
    BsFlag,
    BsFlagFill,
    BsPersonFill,
    BsTrash2Fill,
    BsX,
} from "react-icons/bs";
import axios from "axios";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";

export default function PostMenu(props) {
    const [hoverState, setHoverState] = useState({
        deleteHover: false,
        reportHover: false,
        toProfileHover: false,
        closeMenuHover: false,
    });
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const navigate = useNavigate();

    function handleDeleteHover() {
        setHoverState((prevState) => {
            return { ...prevState, deleteHover: !prevState.deleteHover };
        });
    }

    function handleReportHover() {
        setHoverState((prevState) => {
            return { ...prevState, reportHover: !prevState.reportHover };
        });
    }

    function handleToProfileHover() {
        setHoverState((prevState) => {
            return { ...prevState, toProfileHover: !prevState.toProfileHover };
        });
    }

    function handleCloseMenuHover() {
        setHoverState((prevState) => {
            return { ...prevState, closeMenuHover: !prevState.closeMenuHover };
        });
    }

    const deleteStyle = {
        background: hoverState.deleteHover ? "#eae6ed" : "white",
        transition: "all .08s linear",
        color: "#de4b4b",
    };

    const reportStyle = {
        background: hoverState.reportHover ? "#eae6ed" : "white",
        transition: "all .08s linear",
    };

    const toProfileStyle = {
        background: hoverState.toProfileHover ? "#eae6ed" : "white",
        transition: "all .08s linear",
    };

    const closeMenuStyle = {
        background: hoverState.closeMenuHover ? "#eae6ed" : "white",
        transition: "all .08s linear",
    };

    function handleDeletePost(e) {
        e.stopPropagation();
        fetch(`http://localhost:8080/${props.id}/delete`, {
            method: "DELETE",
            credentials: "include",
        })
            .then((res) => res.text())
            .then((data) => {
                navigate(-1);
            })
            .catch(() => {
                window.location = "http://localhost:3000/login";
            });
    }

    return (
        <div className="postmenu--wrapper">
            <div className="postmenu">
                {props.currentUsername == currentUser?.name && (
                    <div
                        className="postmenu--option"
                        onMouseEnter={handleDeleteHover}
                        onMouseLeave={handleDeleteHover}
                        style={deleteStyle}
                        onClick={handleDeletePost}
                    >
                        <BsTrash2Fill />
                        Delete
                    </div>
                )}
                <div
                    className="postmenu--option"
                    name="reportHover"
                    onMouseEnter={handleReportHover}
                    onMouseLeave={handleReportHover}
                    style={reportStyle}
                >
                    <BsFlagFill />
                    Report
                </div>
                <div
                    className="postmenu--option"
                    name="toProfileHover"
                    onMouseEnter={handleToProfileHover}
                    onMouseLeave={handleToProfileHover}
                    style={toProfileStyle}
                >
                    <BsPersonFill />
                    Go to profile
                </div>
                {/* <div
                    className="postmenu--option"
                    onClick={(e) => {
                        e.stopPropagation();
                        props.handleMenuToggle();
                    }}
                    name="closeMenuHover"
                    onMouseEnter={handleCloseMenuHover}
                    onMouseLeave={handleCloseMenuHover}
                    style={closeMenuStyle}
                >
                    <BsFillXCircleFill />
                    Close
                </div> */}
            </div>
        </div>
    );
}
//only allow delete option if the author username = current user username
