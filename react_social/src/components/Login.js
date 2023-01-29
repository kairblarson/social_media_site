import { BsBugFill } from "react-icons/bs";
import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

//nav done //local done
export default function Login({ handleToggleUpdate }) {
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [inputState, setInputState] = useState({
        emailIsEmpty: false,
        passwordIsEmpty: false,
    });
    const [hoverState, setHoverState] = useState({
        loginHover: false,
        signupHover: false,
    });
    const navigate = useNavigate();

    function handleChange(event) {
        setInputState({ emailIsEmpty: false, passwordIsEmpty: false });
        const { name, value } = event.target;
        setLoginInfo((prevState) => ({ ...prevState, [name]: value }));
    }

    const loginButtonStyle = {
        background: hoverState.loginHover
            ? "rgba(36, 49, 135, .6)"
            : "rgba(34, 58, 214, .6)",
        cursor: hoverState.loginHover ? "pointer" : "default",
        transition: "all .08s linear",
    };

    const signupButtonStyle = {
        background: hoverState.signupHover ? "white" : "black",
        color: hoverState.signupHover ? "black" : "white",
        cursor: hoverState.signupHover ? "pointer" : "default",
        border: hoverState.signupHover ? "1px solid black" : "1px solid white",
        transition: "all .08s linear",
    };

    const emailInputStyle = {
        border: inputState.emailIsEmpty
            ? "1px solid #de4b4b"
            : "1px solid #8a8a8a",
        boxShadow: inputState.emailIsEmpty ? "0 0 5px #de4b4b" : "none",
    };

    const passwordInputStyle = {
        border: inputState.passwordIsEmpty
            ? "1px solid #de4b4b"
            : "1px solid #8a8a8a",
        boxShadow: inputState.passwordIsEmpty ? "0 0 5px #de4b4b" : "none",
    };

    function handleLoginRequest(e) {
        if (e.keyCode === 13 || e.keyCode === undefined) {
            if (
                loginInfo.password.trim() == "" &&
                loginInfo.email.trim() == ""
            ) {
                setErrorMessage("please fill out all required fields");
                setInputState({ emailIsEmpty: true, passwordIsEmpty: true });
            } else if (loginInfo.password.trim() == "") {
                setErrorMessage("please enter a password");
                setInputState({ emailIsEmpty: false, passwordIsEmpty: true });
            } else if (loginInfo.email.trim() == "") {
                setErrorMessage("please enter an email");
                setInputState({ emailIsEmpty: true, passwordIsEmpty: false });
            } else {
                fetch(`${process.env.REACT_APP_BASE_URL}/process`, {
                    credentials: "include",
                    method: "POST",
                    body: new URLSearchParams({
                        email: loginInfo.email,
                        password: loginInfo.password,
                        grant_type: "ROLE_USER",
                    }),
                })
                    .then((res) => {
                        console.log("RES: ", res);
                        if (res.status === 400 || res.status === 404) {
                            return "bad credentials";
                        } else if (res.status === 500) {
                            return "not enabled";
                        }
                        return res.json();
                    })
                    .then((data) => {
                        if (data === "bad credentials") {
                            setErrorMessage("invalid email and password");
                        } else if (data === "not enabled") {
                            setErrorMessage("Account not yet verified")
                        } else {
                            console.log("SUCCESS");
                            localStorage.setItem(
                                "userDetails",
                                JSON.stringify(data)
                            );
                            setErrorMessage("");
                            navigate("/home");
                        }
                        handleToggleUpdate();
                    })
                    .catch((error) => {
                        console.log("ERROR:", error);
                    });
            }
        } else {
            setErrorMessage("");
        }
    }

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/getSessionId`, {
            credentials: "include",
            method: "GET",
        })
            .then((res) => res.text())
            .then((data) => {
                // console.log(data);
            })
            .catch((error) => {
                console.log("ERROR:", error);
            });
    }, []);

    useEffect(() => {
        if (loginInfo.password.trim() != "") {
            setErrorMessage("");
        }
    }, [loginInfo.password]);

    return (
        <div className="login">
            <div className="login--container">
                <div className="login--middle">
                    <h1 className="login--title">
                        <BsBugFill /> Termite
                    </h1>
                    <input
                        type="email"
                        value={loginInfo.email}
                        onChange={handleChange}
                        name="email"
                        placeholder="Email"
                        className="login--email"
                        style={emailInputStyle}
                        onKeyDown={handleLoginRequest}
                    ></input>
                    <input
                        type="password"
                        value={loginInfo.password}
                        onChange={handleChange}
                        name="password"
                        placeholder="Password"
                        className="login--password"
                        style={passwordInputStyle}
                        onKeyDown={handleLoginRequest}
                    ></input>
                    <button
                        onClick={handleLoginRequest}
                        className="login--submit"
                        style={loginButtonStyle}
                        onMouseEnter={() =>
                            setHoverState((prevState) => ({
                                ...prevState,
                                loginHover: !prevState.loginHover,
                            }))
                        }
                        onMouseLeave={() =>
                            setHoverState((prevState) => ({
                                ...prevState,
                                loginHover: !prevState.loginHover,
                            }))
                        }
                    >
                        Login
                    </button>
                    Or
                    <Link to={"/signup"} className="login--signup-wrapper">
                        <button
                            className="login--signup"
                            style={signupButtonStyle}
                            onMouseEnter={() =>
                                setHoverState((prevState) => ({
                                    ...prevState,
                                    signupHover: !prevState.signupHover,
                                }))
                            }
                            onMouseLeave={() =>
                                setHoverState((prevState) => ({
                                    ...prevState,
                                    signupHover: !prevState.signupHover,
                                }))
                            }
                        >
                            Sign up
                        </button>
                    </Link>
                    {errorMessage !== "" && (
                        <small style={{ color: "#de4b4b" }}>
                            {errorMessage}
                        </small>
                    )}
                </div>
            </div>
        </div>
    );
}
{
    /*BUG* When a user submits incorrect data then doesnt fill out a field and then
submits incorrect data again it will highlight that field in red like it has not
been filled out. there is a fix however it would take a lot of restructuring*/
}
