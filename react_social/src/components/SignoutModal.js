import { useState, useEffect } from "react";
import { BsTriangleFill } from "react-icons/bs";
import axios from "axios";

export default function SignoutModal(props) {
    const [isHover, setHover] = useState(false);

    const buttonStyle = {
        cursor: isHover ? "pointer" : "none",
        background: isHover ? "#f6f6f6" : "none",
        transition: "all .08s linear",
    };

    function handleHover() {
        setHover((prevState) => !prevState);
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
                style={buttonStyle}
                className="signoutModal--button"
                onMouseEnter={handleHover}
                onMouseLeave={handleHover}
            >
                Logout
            </button>
        </div>
    );
}
