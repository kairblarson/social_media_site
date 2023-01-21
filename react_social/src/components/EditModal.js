import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

//nav done //local done
export default function EditModal({ open, toggleEdit, oldImg }) {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const [userModel, setUserModel] = useState({
        username: currentUser?.name,
        bio: currentUser?.principal?.bio,
        profilePicture: "",
    });
    const [exitHover, setExitHover] = useState(false);
    const [changePicHover, setChangePicHover] = useState(false);
    const [saveHover, setSaveHover] = useState(false);
    const [imagePreview, setImagePreview] = useState(oldImg);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("userDetails", JSON.stringify(currentUser));
    }, [currentUser]);

    if (!open) return null;

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
        setUserModel((prevState) => ({ ...prevState, [name]: value }));
    }

    function handleImage(e) {
        console.log(e.target.files[0]);
        setUserModel((prevState) => ({
            ...prevState,
            profilePicture: e.target.files[0],
        }));
        setImagePreview(URL.createObjectURL(e.target.files[0]));
    }

    function handleSubmit() {
        const formData = new FormData();
        formData.append("username", userModel.username);
        formData.append("bio", userModel.bio);
        formData.append("profilePicture", userModel.profilePicture);
        axios({
            url: `${process.env.REACT_APP_BASE_URL}/${currentUser.name}/handle-edit`,
            withCredentials: true,
            method: "POST",
            data: formData,
        }).then((res) => console.log(res));
        //the above works do not change anything
        setCurrentUser((prevState) => {
            return {
                ...prevState,
                principal: {
                    ...prevState.principal,
                    bio: userModel.bio,
                    username: userModel.username,
                },
            };
        });
        navigate(`/${currentUser.name}`);
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
                        <img src={imagePreview} className="editModal--pic" />
                    </div>
                    <label
                        htmlFor="upload-image"
                        className="editModal--upload-image"
                        onMouseEnter={() =>
                            setChangePicHover((prevState) => !prevState)
                        }
                        onMouseLeave={() =>
                            setChangePicHover((prevState) => !prevState)
                        }
                        style={changeStyle}
                    >
                        Change pic
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        id="upload-image"
                        onChange={handleImage}
                    ></input>
                    <div className="editModal--fields">
                        <div className="editModal--input">
                            <h4>Username</h4>
                            <input
                                type="text"
                                name="username"
                                value={userModel.username}
                                onChange={handleChange}
                            ></input>
                        </div>
                        <div className="editModal--input">
                            <h4>Bio</h4>
                            <textarea
                                type="text"
                                name="bio"
                                value={userModel.bio}
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
                            onClick={handleSubmit}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
