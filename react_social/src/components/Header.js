import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";

export default function Header() {
    const { handle, interaction, id } = useParams();
    const currentLocation = useLocation();
    const [hoverState, setHoverState] = useState({
        followersHover: false,
        followingHover: false,
        backHover: false,
    });
    const search = useLocation().search;
    const repostedBy = new URLSearchParams(search).get("repost");
    const [title, setTitle] = useState();
    const [toggleArrow, setToggleArrow] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        //this determines the header title
        switch (currentLocation.pathname) {
            case "/home":
                {
                    setTitle("Home");
                    setToggleArrow(false);
                }
                break;
            case `/${handle}`:
                setTitle(`${handle}`);
                break;
            case `/${handle}/likes`:
                setTitle(`${handle}'s likes`);
                break;
            case `/${handle}/following`:
                setTitle("Following");
                break;
            case `/${handle}/followers`:
                setTitle("Followers");
                break;
            case `/${handle}/post/${id}`:
                setTitle("Thread");
                break;
            case `/${handle}/post/${id}/likes`:
                setTitle("Likes");
                break;
            case `/${handle}/post/${id}/reposts`:
                setTitle("Reposts");
                break;
            case `/${handle}/notifications`:
                setTitle("Notifications");
                break;
            default: "Unknown location";
        }
    }, []);

    const backStyle = {
        background: hoverState.backHover ? "#eae6ed" : "white",
        cursor: hoverState.backHover ? "pointer" : "none",
    };

    function handleBackHover() {
        setHoverState((prevState) => ({
            ...prevState,
            backHover: !prevState.backHover,
        }));
    }

    function handleBackClick() {
        navigate(-1);
    }

    return (
        <div className="header">
            <div className="userlist--top-main">
                {toggleArrow && (
                    <BsArrowLeft
                        className="userlist--back"
                        style={backStyle}
                        onMouseEnter={handleBackHover}
                        onMouseLeave={handleBackHover}
                        onClick={handleBackClick}
                    />
                )}
                <div className="userlist--userdetails">
                    <h4 className="userlist--username">{title}</h4>
                </div>
            </div>
        </div>
    );
}
