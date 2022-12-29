import { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import {
    BsArrowUpSquareFill,
    BsThreeDots,
    BsTriangle,
    BsTriangleFill,
} from "react-icons/bs";

export default function Preview(props) {
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [isHover, setHover] = useState(false);

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

    const previewStyle = {
        cursor: isHover ? "pointer" : "none",
    };

    function handleHover() {
        setHover((prevState) => !prevState);
    }

    return (
        <div
            className="preview"
            onClick={handleSignout}
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
            style={previewStyle}
        >
            <div className="preview--triangle">
                <BsTriangleFill />
            </div>
            <h4 className="preview--username">
                {!props.isAuth ? "Sign in" : userDetails?.principal.username}
            </h4>
        </div>
    );
    //limit usernames to like 15 characters
}
