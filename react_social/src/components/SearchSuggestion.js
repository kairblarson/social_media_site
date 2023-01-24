import { useState } from "react";

//nav done //local done
export default function SearchSuggestion({
    username,
    bio,
    profilePicture,
    handleClick,
    fullName,
    ppCDNLink
}) {
    const [hover, setHover] = useState(false);

    const suggestionStyle = {
        background: hover ? "#f6f6f6" : "none",
        cursor: hover ? "pointer" : "none",
    };

    return (
        <div
            className="searchsuggestion"
            onClick={() => handleClick(username)}
            onMouseEnter={() => setHover((prevState) => !prevState)}
            onMouseLeave={() => setHover((prevState) => !prevState)}
            style={suggestionStyle}
        >
            <div className="searchsuggestion--left">
                <img src={ppCDNLink} className="searchsuggestion--img"></img>
            </div>
            <div className="searchsuggestion--right">
                <div className="searchsuggestion--user">
                    <div className="searchsuggestion--username">{username}</div>
                    <div className="searchsuggestion--fullname">{fullName}</div>
                </div>
                <div className="searchsuggestion--bio">{bio}</div>
            </div>
        </div>
    );
}
