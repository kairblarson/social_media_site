import { useState, useEffect } from "react";

export default function EditModal({ open, toggleEdit }) {
    if (!open) return null;

    const [currentUser, setCurrentUser] = useState(
        localStorage.getItem("userDetails")
    );
    const [inputState, setInputState] = useState({
        usernameField: "",
        bioField: "",
        profilePicField: "",
    });

    function handleChange(e) {
        const { name, value, type } = e.target;
        setInputState((prevState) => ({ ...prevState, [name]: value }));
    }

    return (
        <div className="editModal--wrapper" onClick={() => toggleEdit()}>
            <div className="editModal" onClick={(e) => e.stopPropagation()}>
                <div className="editModal--pic-wrapper">
                    <img
                        src={"/images/standard.jpg"}
                        className="editModal--pic"
                    />
                </div>
                <div className="editModal--fields">
                    <div className="editModal--input">
                        <label>Username</label>
                        <input
                            type="text"
                            name="usernameField"
                            value={inputState.usernameField}
                            onChange={handleChange}
                        ></input>
                    </div>
                    <div className="editModal--input">
                        <label>Bio</label>
                        <textarea
                            type="text"
                            name="bioField"
                            value={inputState.bioField}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}
