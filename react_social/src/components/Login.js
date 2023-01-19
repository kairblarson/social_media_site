import { BsBugFill } from "react-icons/bs";
import { useState, useEffect } from "react";

export default function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [inputState, setInputState] = useState({
        emailIsEmpty: false,
        passwordIsEmpty: false,
    });
    const [loginButtonState, setLoginButtonState] = useState({
        isHover: false,
    });

    function handleChange(event) {
        setInputState({ emailIsEmpty: false, passwordIsEmpty: false });
        const { name, value } = event.target;
        setLoginInfo((prevState) => ({ ...prevState, [name]: value }));
    }

    const loginButtonStyle = {
        background: loginButtonState.isHover
            ? "rgba(36, 49, 135, .6)"
            : "rgba(34, 58, 214, .6)",
        cursor: loginButtonState.isHover ? "pointer" : "none",
    };

    const emailInputStyle = {
        border: inputState.emailIsEmpty
            ? "1px solid #de4b4b"
            : "1px solid #8a8a8a",
        boxShadow: inputState.emailIsEmpty
            ? "0 0 5px #de4b4b"
            : "none",
    };

    const passwordInputStyle = {
        border: inputState.passwordIsEmpty
            ? "1px solid #de4b4b"
            : "1px solid #8a8a8a",
        boxShadow: inputState.passwordIsEmpty
            ? "0 0 5px #de4b4b"
            : "none",
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
                fetch("http://localhost:8080/process", {
                    credentials: "include",
                    method: "POST",
                    body: new URLSearchParams({
                        email: loginInfo.email,
                        password: loginInfo.password,
                        grant_type: "ROLE_USER",
                    }),
                })
                    .then((res) => {
                        if (res.status === 400) {
                            return "bad credentials";
                        }
                        return res.json();
                    })
                    .then((data) => {
                        if (data === "bad credentials") {
                            console.log("FAILURE");
                            setErrorMessage("invalid email and password");
                        } else {
                            console.log("SUCCESS");
                            localStorage.setItem(
                                "userDetails",
                                JSON.stringify(data)
                            );
                            window.location = "http://localhost:3000/home";
                        }
                    })
                    .catch((error) => {
                        console.log("ERROR:", error);
                    });
            }
        }
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
