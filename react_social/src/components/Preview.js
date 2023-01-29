import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";

//nav done //local done
export default function Preview(props) {
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [isHover, setHover] = useState(false);

    useEffect(() => {
        setUserDetails(JSON.parse(localStorage.getItem("userDetails")));
    }, [window.location.pathname, props.update]);

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
            {props.isAuth && (
                <img
                    src={userDetails?.principal.ppCDNLink}
                    className="preview--pic"
                ></img>
            )}
            {!props.isAuth && (
                <img src="/images/standard.jpg" className="preview--pic"></img>
            )}
            <div className="preview--userdetails">
                <h4 className="preview--username">
                    {!props.isAuth
                        ? "Sign in"
                        : userDetails?.principal.username}
                </h4>
                <p className="preview--fullname">
                    {!props.isAuth ? "" : userDetails?.principal.fullName}
                </p>
            </div>
            <div className="preview--menu">
                <BsThreeDots />
            </div>
        </div>
    );
    //limit usernames to like 15 characters
}
