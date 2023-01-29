import { useState, useEffect } from "react";
import { BsBugFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ColorRing } from "react-loader-spinner";

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
    const [resetButtonHover, setResetButtonHover] = useState(false);
    const [submitButtonHover, setSubmitButtonHover] = useState(false);
    const [backButtonHover, setBackButtonHover] = useState(false);
    const [imagePreview, setImagePreview] = useState("../images/standard.jpg");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    function handleSignUp() {
        setLoading(true);
        const formData = new FormData();
        formData.append("username", inputState.username);
        formData.append("bio", inputState.bio);
        formData.append("email", inputState.email);
        formData.append("fullName", inputState.fullName);
        formData.append("password", inputState.password);
        formData.append("profilePicture", inputState.profilePicture);
        axios({
            url: `${process.env.REACT_APP_BASE_URL}/process-signup`,
            withCredentials: true,
            method: "POST",
            data: formData,
        }).then((res) => {
            console.log("RES: ", res);
            setLoading(false);
            if (res.data == "email taken") {
                setErrorMessage("an account with that email already exists");
            } else if (res.data == "username taken") {
                setErrorMessage("An account with that username already exists");
            } else {
                setSuccessMessage(
                    "A verification link has been sent to your email"
                );
            }
        });
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setInputState((prevState) => ({ ...prevState, [name]: value }));
    }

    function handleImage(e) {
        console.log(e.target.files[0]);
        setInputState((prevState) => ({
            ...prevState,
            profilePicture: e.target.files[0],
        }));
        setImagePreview(URL.createObjectURL(e.target.files[0]));
    }

    function resetForm() {
        setInputState({
            username: "",
            email: "",
            password: "",
            fullName: "",
            bio: "",
            profilePicture: "",
        });
        setImagePreview("../images/standard.jpg");
    }

    const chooseStyle = {
        background: ChoosePicHover ? "rgba(240,240,240, .9)" : "white",
        cursor: ChoosePicHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const resetStyle = {
        background: resetButtonHover ? "rgba(255, 131, 133, 0.8)" : "#de4b4b",
        cursor: resetButtonHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const submitStyle = {
        background: submitButtonHover
            ? "rgba(134, 63, 217, .7)"
            : "rgba(134, 63, 217, 1)",
        cursor: submitButtonHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const backStyle = {
        background: backButtonHover ? "rgba(0, 0, 0, .7)" : "black",
        cursor: backButtonHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    if (successMessage != "")
        return (
            <div className="signupPage">
                <div
                    className="signupPage--container"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <h4>{successMessage}</h4>
                </div>
            </div>
        );

    return (
        <div
            className="signupPage"
            style={{
                background: isLoading ? "white" : "rgba(134, 63, 217, 1)",
            }}
        >
            {!isLoading ? (
                <div className="signupPage--container">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <h3 className="signupPage--title">
                            <BsBugFill />
                            Termite
                        </h3>
                        <h3 className="signupPage--create">
                            Create new account
                        </h3>
                    </div>
                    <hr></hr>
                    <p
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "40px",
                            width: "100%",
                            color: "red",
                        }}
                    >
                        {errorMessage}
                    </p>
                    <div className="signupPage--main">
                        <div className="signupPage--left">
                            <img
                                src={imagePreview}
                                className="signupPage--pic"
                            />
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
                            <button
                                className="signupPage--submit"
                                style={submitStyle}
                                onMouseEnter={() =>
                                    setSubmitButtonHover(
                                        (prevState) => !prevState
                                    )
                                }
                                onMouseLeave={() =>
                                    setSubmitButtonHover(
                                        (prevState) => !prevState
                                    )
                                }
                                onClick={handleSignUp}
                            >
                                Sign up!
                            </button>
                            <div className="signupPage--buttons">
                                <button
                                    className="signupPage--reset"
                                    style={backStyle}
                                    onMouseEnter={() =>
                                        setBackButtonHover(
                                            (prevState) => !prevState
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setBackButtonHover(
                                            (prevState) => !prevState
                                        )
                                    }
                                    onClick={() => navigate(-1)}
                                >
                                    Back
                                </button>
                                <button
                                    className="signupPage--reset"
                                    style={resetStyle}
                                    onMouseEnter={() =>
                                        setResetButtonHover(
                                            (prevState) => !prevState
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setResetButtonHover(
                                            (prevState) => !prevState
                                        )
                                    }
                                    onClick={resetForm}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <ColorRing
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                    colors={[
                        "rgba(134, 63, 217, .9)",
                        "rgba(134, 63, 217, .7)",
                        "rgba(134, 63, 217, .5)",
                        "rgba(134, 63, 217, .3)",
                        "rgba(134, 63, 217, .1)",
                    ]}
                />
            )}
        </div>
    );
}
