import { useState, useEffect } from "react";

export default function EditModal({ open, toggleEdit }) {
    if (!open) return null;

    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [inputState, setInputState] = useState({
        usernameField: currentUser.name,
        bioField: currentUser.principal.bio,
        profilePicField: "",
    });
    const [exitHover, setExitHover] = useState(false);
    const [changePicHover, setChangePicHover] = useState(false);
    const [saveHover, setSaveHover] = useState(false);

    const exitStyle = {
        background: exitHover ? "#e8e8e8" : "rgba(134, 63, 217, 1)",
        color: exitHover ? "black" : "white",
        cursor: exitHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const changeStyle = {
        background: changePicHover ? "rgba(0,0,0,.7)" : "black",
        cursor: changePicHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const saveStyle = {
        background: saveHover
            ? "rgba(134, 63, 217, .8)"
            : "rgba(134, 63, 217, 1)",
        cursor: saveHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    function handleChange(e) {
        const { name, value, type } = e.target;
        setInputState((prevState) => ({ ...prevState, [name]: value }));
    }

    return (
        <div className="editModal--wrapper" onClick={() => toggleEdit()}>
            <div className="editModal" onClick={(e) => e.stopPropagation()}>
                <div className="editModal--header">
                    <div
                        className="editModal--exit"
                        onMouseEnter={() =>
                            setExitHover((prevState) => !prevState)
                        }
                        onMouseLeave={() =>
                            setExitHover((prevState) => !prevState)
                        }
                        style={exitStyle}
                        onClick={() => toggleEdit()}
                    >
                        X
                    </div>
                    <div className="editModal--title">Edit profile</div>
                </div>
                <div className="editModal--main">
                    <div className="editModal--pic-wrapper">
                        <img
                            src={"/images/standard.jpg"}
                            className="editModal--pic"
                        />
                    </div>
                    <div
                        className="editModal--upload-image"
                        onMouseEnter={() =>
                            setChangePicHover((prevState) => !prevState)
                        }
                        onMouseLeave={() =>
                            setChangePicHover((prevState) => !prevState)
                        }
                        style={changeStyle}
                    >
                        <label for="upload-image">Change pic</label>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        id="upload-image"
                    ></input>
                    <div className="editModal--fields">
                        <div className="editModal--input">
                            <h4>Username</h4>
                            <input
                                type="text"
                                name="usernameField"
                                value={inputState.usernameField}
                                onChange={handleChange}
                            ></input>
                        </div>
                        <div className="editModal--input">
                            <h4>Bio</h4>
                            <textarea
                                type="text"
                                name="bioField"
                                value={inputState.bioField}
                                onChange={handleChange}
                                className="editModal--bioField"
                            ></textarea>
                        </div>
                    </div>
                    <div className="editModal--save-wrapper">
                        <button
                            className="editModal--save"
                            onMouseEnter={() =>
                                setSaveHover((prevState) => !prevState)
                            }
                            onMouseLeave={() =>
                                setSaveHover((prevState) => !prevState)
                            }
                            style={saveStyle}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
