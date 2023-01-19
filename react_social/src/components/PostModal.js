import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

export default function PostModal({ open, closeModal, onSubmit, targetPost }) {
    if (!open) return null;

    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );

    function handleClick(e) {
        e.stopPropagation();
    }

    const [hoverState, setHoverState] = useState({
        exitHover: false,
        submitHover: false,
    });

    const [inputState, setInputState] = useState({
        postInput: "",
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setInputState((prevState) => ({ ...prevState, [name]: value }));
    }

    const exitStyle = {
        background: hoverState.exitHover ? "#eae6ed" : "#f6f6f6",
        cursor: hoverState.exitHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    const submitStyle = {
        background: hoverState.submitHover
            ? "rgba(134, 63, 217, .7)"
            : "rgba(134, 63, 217, .9)",
        cursor: hoverState.submitHover ? "pointer" : "none",
    };

    function handleSubmitHover() {
        setHoverState((prevState) => ({
            ...prevState,
            submitHover: !prevState.submitHover,
        }));
    }

    function handleExitHover() {
        setHoverState((prevState) => ({
            ...prevState,
            exitHover: !prevState.exitHover,
        }));
    }

    return (
        <div className="postmodal--overlay" onClick={() => closeModal()}>
            <div className="postmodal--container" onClick={handleClick}>
                <div className="postmodal--left">
                    <div className="postmodal--pic-wrapper">
                        <img
                            src={
                                "data:image/png;base64," +
                                userDetails.principal.profilePicture
                            }
                            className="postmodal--pic"
                        />
                    </div>
                </div>
                <div className="postmodal--right">
                    <div className="postmodal--top">
                        <p
                            className="postmodal--exit"
                            onClick={() => closeModal()}
                            style={exitStyle}
                            onMouseEnter={handleExitHover}
                            onMouseLeave={handleExitHover}
                        >
                            X
                        </p>
                    </div>
                    <div className="postmodal--main">
                        <h1 className="postmodal--username">
                            {userDetails?.name}
                        </h1>
                        {targetPost && (
                            <p className="postmodal--reply">
                                Replying to {targetPost.author.username}
                            </p>
                        )}
                        <textarea
                            placeholder="Whats on your mind?"
                            className="postmodal--comment-area"
                            name="postInput"
                            value={inputState.postInput}
                            onChange={handleChange}
                            maxLength={250}
                            onKeyDown={(e) => {
                                if(e.key === "Enter") {
                                    console.log("ENTER");
                                    onSubmit(inputState.postInput)
                                }
                            }}
                        ></textarea>
                    </div>
                    <div className="postmodal--bottom">
                        <div className="postmodal--char">
                            Chars left: {250 - inputState.postInput?.length}
                        </div>
                        <button
                            className="postmodal--post-button"
                            onClick={() => onSubmit(inputState.postInput)}
                            style={submitStyle}
                            onMouseEnter={handleSubmitHover}
                            onMouseLeave={handleSubmitHover}
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
