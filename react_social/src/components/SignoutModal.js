import { useState, useEffect } from "react";
import { BsChatDotsFill, BsColumnsGap, BsFile, BsFillReplyFill, BsTriangleFill } from "react-icons/bs";
import axios from "axios";
import { useNavigate } from "react-router-dom";

//nav done //local done
export default function SignoutModal(props) {
    //this is really a popover but you get what i mean
    const [hoverState, setHoverState] = useState({
        logoutHover: false,
        moreHover: false,
    });
    const navigate = useNavigate();

    const logoutButtonStyle = {
        cursor: hoverState.logoutHover ? "pointer" : "none",
        background: hoverState.logoutHover ? "#eae6ed" : "white",
        transition: "all .08s linear",
    };

    const moreButtonStyle = {
        cursor: hoverState.moreHover ? "pointer" : "none",
        background: hoverState.moreHover ? "#eae6ed" : "white",
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
            url: `${process.env.REACT_APP_BASE_URL}/logout`,
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
                navigate('/login');
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
                <div className="signoutModal--logout-icon">
                    <BsFillReplyFill />
                </div>
                {props.isAuth ? "Sign out" : "Sign in"}
            </button>
            <button
                style={moreButtonStyle}
                className="signoutModal--button"
                onMouseEnter={handleMoreHover}
                onMouseLeave={handleMoreHover}
            >
                <div>
                    <BsColumnsGap />
                </div>
                More...
            </button>
        </div>
    );
}
