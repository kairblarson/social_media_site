export default function NavButton(props) {
    const buttonStyles = {
        fontWeight: props.isSelected ? "700" : "400",
        background: props.isHover ? "#e8e8e8" : "white",
        cursor: props.isHover ? "pointer" : "none",
        transition: "all .08s linear",
    };

    return (
        <div
            className="navbar--button"
            onMouseEnter={() => props.handleHover(props.id)}
            onMouseLeave={() => props.handleHover(props.id)}
            style={buttonStyles}
            onClick={() => props.handleClick(props.id)}
        >
            <div className="navbar--icon">{props.icon}</div>
            {props.name == "Notifications" &&  props.notifs > 0 && (
                <div className="navbar--notifs">{props.notifs}</div>
            )}
            {props.name}
        </div>
    );
}
