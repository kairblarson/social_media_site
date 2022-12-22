import { useEffect, useState } from "react";

export default function NoteToSelf(props) {
    const [reminder, setReminder] = useState();
    const [hoverState, setHoverState] = useState({
        saveHover: false,
    });

    function handleChange(event) {
        const { value } = event.target;
        setReminder(value);
    }

    useEffect(() => {
        setReminder(localStorage.getItem("Reminder"));
    }, []);

    const buttonStyle = {
        background: hoverState.saveHover
            ? "rgba(134, 63, 217, .7)"
            : "rgba(134, 63, 217, .9)",
        cursor: hoverState.saveHover ? "pointer" : "none",
        transition: "all .08s linear"
    };

    function handleSaveHover() {
        setHoverState((prevState) => ({
            ...prevState,
            saveHover: !prevState.saveHover,
        }));
    }

    return (
        <div className="notetoself">
            <h4 className="notetoself--title">Note to self</h4>
            <textarea
                className="notetoself--textarea"
                placeholder="Work in progress..."
                name="reminder"
                onChange={handleChange}
                value={reminder}
            />
            <div className="notetoself--bottom">
                <button
                    className="notetoself--save"
                    onClick={() => localStorage.setItem("Reminder", reminder)}
                    style={buttonStyle}
                    onMouseEnter={handleSaveHover}
                    onMouseLeave={handleSaveHover}
                >
                    Save
                </button>
            </div>
        </div>
    );
}
