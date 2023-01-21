//nav done //local done
export default function NavButton(props) {
    const buttonStyles = {
        fontWeight: props.isSelected ? "700" : "400",
        background: props.isHover ? "#eae6ed" : "white",
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
            {props.name == "Notifications" && props.notifs > 0 && (
                <div className="navbar--notifs">{props.notifs}</div>
            )}
            {props.name == "Messages" && props?.unreadMessages > 0 && (
                <div className="navbar--messages">{props.unreadMessages}</div>
            )}
            {props.name}
            {props.isSelected && (
                <div className="navbar--select-wrapper">
                    <div className="navbar--selected"></div>
                </div>
            )}
        </div>
    );
}
