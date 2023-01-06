import { BsBugFill } from "react-icons/bs";
import { useState, useEffect } from "react";

export default function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setLoginInfo((prevState) => ({ ...prevState, [name]: value }));
    }

    const [loginButtonState, setLoginButtonState] = useState({
        isHover: false,
    });

    const loginButtonStyle = {
        background: loginButtonState.isHover
            ? "rgba(36, 49, 135, .6)"
            : "rgba(34, 58, 214, .6)",
        cursor: loginButtonState.isHover ? "pointer" : "none",
    };

    const [inputState, setInputState] = useState({
        emailIsEmpty: false,
        passwordIsEmpty: false,
    });

    const emailInputStyle = {
        border: inputState.emailIsEmpty
            ? "1px solid rgb(250, 15, 15)"
            : "1px solid #9e9e9e",
    };

    const passwordInputStyle = {
        border: inputState.passwordIsEmpty
            ? "1px solid rgb(250, 15, 15)"
            : "1px solid #9e9e9e",
    };

    function handleLoginRequest() {
        console.log("REQUEST SENT", JSON.stringify(loginInfo));

        fetch("http://localhost:8080/process", {
            credentials: "include",
            method: "POST",
            body: new URLSearchParams({
                email: loginInfo.email,
                password: loginInfo.password,
                grant_type: "ROLE_USER",
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.exception === "Bad credentials") {
                    console.log("DISPLAY INVALID TO DOM");
                } else {
                    console.log(data);
                    localStorage.setItem("userDetails", JSON.stringify(data));
                    window.location = "http://localhost:3000/home";
                }
            })
            .catch((error) => {
                console.log("ERROR:", error);
            });
    }

    useEffect(() => {
        fetch("http://localhost:8080/getSessionId", {
            credentials: "include",
            method: "GET",
        })
            .then((res) => res.text())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.log("ERROR:", error);
            });
    }, []);

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
                    ></input>
                    <input
                        type="password"
                        value={loginInfo.password}
                        onChange={handleChange}
                        name="password"
                        placeholder="Password"
                        className="login--password"
                        style={passwordInputStyle}
                    ></input>
                    <button
                        onClick={() => {
                            if (
                                loginInfo.email.trim() === "" &&
                                loginInfo.password.trim() === ""
                            ) {
                                setInputState(() => ({
                                    emailIsEmpty: true,
                                    passwordIsEmpty: true,
                                }));
                                console.log("Both fields empty");
                            } else if (loginInfo.email.trim() === "") {
                                setInputState(() => ({
                                    emailIsEmpty: true,
                                    passwordIsEmpty: false,
                                }));
                            } else if (loginInfo.password.trim() === "") {
                                setInputState(() => ({
                                    emailIsEmpty: false,
                                    passwordIsEmpty: true,
                                }));
                            } else {
                                handleLoginRequest();
                            }
                        }}
                        className="login--submit"
                        style={loginButtonStyle}
                        onMouseEnter={() =>
                            setLoginButtonState((prevState) => ({
                                ...prevState,
                                isHover: !prevState.isHover,
                            }))
                        }
                        onMouseLeave={() =>
                            setLoginButtonState((prevState) => ({
                                ...prevState,
                                isHover: !prevState.isHover,
                            }))
                        }
                    >
                        Login
                    </button>
                    Or
                    <button className="login--signup">Sign up</button>
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
