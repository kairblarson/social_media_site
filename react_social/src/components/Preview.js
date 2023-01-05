import { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import {
    BsArrowUpSquareFill,
    BsThreeDots,
    BsTriangle,
    BsTriangleFill,
} from "react-icons/bs";
import SignoutModal from "./SignoutModal";

export default function Preview(props) {
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [isHover, setHover] = useState(false);

    const previewStyle = {
        cursor: isHover ? "pointer" : "none",
        background: isHover ? "#f6f6f6" : "none",
        transition: "all .08s linear",
    };

    function handleHover() {
        setHover((prevState) => !prevState);
    }

    return (
        <div
            className="preview"
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
            style={previewStyle}
            onClick={props.toggleSignout}
        >
            {props.isAuth && <img
                src={
                    "data:image/png;base64," +
                    userDetails?.principal.profilePicture
                }
                className="preview--pic"
            ></img>} {/*display a default img for pp if user not signed in*/}
            <div className="preview--userdetails">
                <h4 className="preview--username">
                    {!props.isAuth
                        ? "Sign in"
                        : userDetails?.principal.username}
                </h4>
                <p className="preview--fullname">
                    {!props.isAuth
                        ? ""
                        : userDetails?.principal.fullName}
                </p>
            </div>
            <div className="preview--menu">
                <BsThreeDots />
            </div>
        </div>
    );
    //limit usernames to like 15 characters
}
