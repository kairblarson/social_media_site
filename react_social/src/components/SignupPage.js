import { useState, useEffect } from "react";
import { BsBugFill } from "react-icons/bs";

export default function SignupPage() {
    const [inputState, setInputState] = useState({
        username: "",
        email: "",
        password: "",
        fullName: "",
        bio: "",
        profilePicture: "",
    });
    const [ChoosePicHover, setChoosePicHover] = useState(false);
    const [imagePreview, setImagePreview] = useState();

    function handleChange(event) {
        setInputState({ emailIsEmpty: false, passwordIsEmpty: false });
        const { name, value } = event.target;
        setLoginInfo((prevState) => ({ ...prevState, [name]: value }));
    }

    function handleImage(e) {
        console.log(e.target.files[0]);
        setInputState((prevState) => ({
            ...prevState,
            profilePicture: e.target.files[0],
        }));
        setImagePreview(URL.createObjectURL(e.target.files[0]));
    }

    const chooseStyle = {
        background: ChoosePicHover ? "rgba(230,230,230,.7)" : "white",
        cursor: ChoosePicHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    return (
        <div className="signupPage">
            <div className="signupPage--container">
                <h3 className="signupPage--title">
                    <BsBugFill />
                    Create new account
                </h3>
                <hr style={{marginBottom: "30px"}}></hr>
                <div className="signupPage--main">
                    <div className="signupPage--left">
                        <div className="signupPage--image-wrapper">
                            <img
                                src={imagePreview}
                                className="signupPage--pic"
                            />
                        </div>
                        <label
                            htmlFor="upload-image"
                            className="signupPage--upload-image"
                            onMouseEnter={() =>
                                setChoosePicHover((prevState) => !prevState)
                            }
                            onMouseLeave={() =>
                                setChoosePicHover((prevState) => !prevState)
                            }
                            style={chooseStyle}
                        >
                            Choose pic
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            id="upload-image"
                            onChange={handleImage}
                        ></input>
                        <input
                            type="email"
                            value={inputState.email}
                            onChange={handleChange}
                            name="email"
                            placeholder="Email"
                            className="signupPage--input"
                        ></input>
                        <input
                            type="text"
                            value={inputState.username}
                            onChange={handleChange}
                            name="username"
                            placeholder="Username"
                            className="signupPage--input"
                        ></input>
                        <input
                            type="text"
                            value={inputState.fullName}
                            onChange={handleChange}
                            name="fullName"
                            placeholder="Full name"
                            className="signupPage--input"
                        ></input>
                        <input
                            type="password"
                            value={inputState.password}
                            onChange={handleChange}
                            name="password"
                            placeholder="Password"
                            className="signupPage--input"
                        ></input>
                    </div>
                    <div className="signupPage--right">
                        <textarea
                            type="text"
                            placeholder="Bio"
                            className="signupPage--bio-input"
                            name="bio"
                            value={inputState.bio}
                            onChange={handleChange}
                        />
                        <div className="signupPage--buttons">
                            <button>Reset</button>
                            <button>Sign up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
