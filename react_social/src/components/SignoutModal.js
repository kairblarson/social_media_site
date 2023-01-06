import { useState, useEffect } from "react";
import { BsTriangleFill } from "react-icons/bs";
import axios from "axios";

export default function SignoutModal(props) {
    const [hoverState, setHoverState] = useState({
        logoutHover: false,
        moreHover: false,
    });

    const logoutButtonStyle = {
        cursor: hoverState.logoutHover ? "pointer" : "none",
        background: hoverState.logoutHover? "#f6f6f6" : "white",
        transition: "all .08s linear",
    };

    const moreButtonStyle = {
        cursor: hoverState.moreHover ? "pointer" : "none",
        background: hoverState.moreHover? "#f6f6f6" : "white",
        transition: "all .08s linear",
    };

    function handleLogoutHover() {
        setHoverState((prevState) => {
            return { ...prevState, logoutHover: !prevState.logoutHover };
        });
    }

    function handleMoreHover() {
        setHoverState((prevState) => {
            return { ...prevState, moreHover: !prevState.moreHover };
        });
    }

    function handleSignout() {
        axios({
            url: "http://localhost:8080/logout",
            withCredentials: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                console.log(res);
                localStorage.setItem("userDetails", null);
                console.log("SIGNOUT");
                window.location = "http://localhost:3000/login";
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div className="signoutModal">
            <button
                onClick={handleSignout}
                style={logoutButtonStyle}
                className="signoutModal--button"
                onMouseEnter={handleLogoutHover}
                onMouseLeave={handleLogoutHover}
            >
                Logout
            </button>
            <button
                style={moreButtonStyle}
                className="signoutModal--button"
                onMouseEnter={handleMoreHover}
                onMouseLeave={handleMoreHover}
            >
                More...
            </button>
        </div>
    );
}
