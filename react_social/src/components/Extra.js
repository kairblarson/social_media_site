import { useState } from "react";
import Preview from "./Preview";
import NoteToSelf from "./NoteToSelf";
import SignoutModal from "./SignoutModal";
//you have to import your context component and the useContext hook

//nav done //local done
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
            <Preview
                username={userState.username}
                img={userState.profile_img}
                isAuth={props.isAuth}
                toggleSignout={toggleSignout}
                update={props.update}
            />
            {showSignout && <SignoutModal isAuth={props.isAuth} />}
        </div>
    );
}
//{props.isAuth && <NoteToSelf />}
//if you even want to bring back note to self
