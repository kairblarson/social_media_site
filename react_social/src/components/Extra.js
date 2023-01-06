import { useState, useContext } from "react";
import Preview from "./Preview";
import PostModal from "./PostModal";
import { BsSearch } from "react-icons/bs";
import UserContext from "./UserContext";
import NoteToSelf from "./NoteToSelf";
import SignoutModal from "./SignoutModal";
import { CPopover, CButton } from "@coreui/react";
//you have to import your context component and the useContext hook

export default function Extra(props) {
    const [userState, setUserState] = useState({
        username: "",
        profile_img: "",
    });
    const [inputState, setInputState] = useState({
        searchInput: "",
    });
    const [buttonState, setButtoonState] = useState({
        isHover: false,
    });
    const [showSignout, setShowSignout] = useState(false);

    function handleHover() {
        setButtoonState((prevState) => ({
            ...prevState,
            isHover: !prevState.isHover,
        }));
    }

    function toggleSignout() {
        setShowSignout((prevState) => !prevState);
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setInputState((prevState) => ({ ...prevState, [name]: value }));
    }

    const buttonStyle = {
        background: buttonState.isHover
            ? "rgba(134, 63, 217, .7)"
            : "rgba(134, 63, 217, 1)",
        cursor: buttonState.isHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    return (
        <div className="extra">
            {/* <input
                type="text"
                placeholder="Search..."
                className="extra--search"
                name="searchInput"
                value={inputState.searchInput}
                onChange={handleChange}
            ></input> */}
            {props.isAuth && (
                <button
                    className="extra--post-button"
                    onMouseLeave={handleHover}
                    onMouseEnter={handleHover}
                    style={buttonStyle}
                    onClick={() => props.openModal()}
                >
                    Post
                </button>
            )}
            {props.isAuth && <NoteToSelf />}
            <Preview
                username={userState.username}
                img={userState.profile_img}
                isAuth={props.isAuth}
                toggleSignout={toggleSignout}
            />
            {showSignout && <SignoutModal />}
        </div>
    );
}
//at the top show the currently logged in user
//at the bottom or right below the current user display have the search bar
