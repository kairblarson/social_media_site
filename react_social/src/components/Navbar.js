import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import {
    BsHouseFill,
    BsFillBellFill,
    BsFillEnvelopeFill,
    BsFillPersonFill,
    BsBugFill,
} from "react-icons/bs";
import NavButton from "./NavButton";
import { Link, useParams, useLocation } from "react-router-dom";

export default function Navbar() {
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails"))
    );
    const currentLocation = useLocation();
    const { handle } = useParams();
    const [notifications, setNotifications] = useState();
    const [buttonState, setButtonState] = useState([
        {
            id: 0,
            icon: <BsHouseFill />,
            name: "Home",
            isHover: false,
            isSelected: false,
        },
        {
            id: 1,
            icon: <BsFillBellFill />,
            name: "Notifications",
            isHover: false,
            isSelected: false,
        },
        {
            id: 2,
            icon: <BsFillEnvelopeFill />,
            name: "Messages",
            isHover: false,
            isSelected: false,
        },
        {
            id: 3,
            icon: <BsFillPersonFill />,
            name: "Profile",
            isHover: false,
            isSelected: false,
        },
    ]);

    useEffect(() => {
        fetch("http://localhost:8080/get-notifications?exact=false", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setNotifications(data);
                if(currentLocation.pathname == `/${handle}/notifications`) {
                    setNotifications(0);
                }
            }).catch((err) => setNotifications(0));
        //maybe make this api call in the app component and pass it down through props
    }, []);

    function handleButtonHover(id) {
        setButtonState((prevState) => {
            return prevState.map((button) => {
                return button.id === id
                    ? { ...button, isHover: !button.isHover }
                    : button;
            });
        });
    }

    function handleButtonclick(id) {
        switch (id) {
            case 0:
                window.location = "http://localhost:3000/home";
                break;
            case 1:
                window.location = `http://localhost:3000/${userDetails.name}/notifications`;
                break;
            case 2:
                //messages
                break;
            case 3:
                if (userDetails == null) {
                    window.location = `http://localhost:3000/login`;
                }
                window.location = `http://localhost:3000/${userDetails.name}`;
                break;
            default:
                fetch("http://localhost:8080/test", {
                    method: "GET",
                    credentials: "include",
                })
                    .then((res) => res.json())
                    .then((data) => console.log(data));
                break;
        }
    }

    const navButtons = buttonState.map((button) => {
        if ("/" + button.name.toLowerCase() == currentLocation.pathname) {
            return { ...button, isSelected: true };
        }
        if (
            userDetails?.name == currentLocation.pathname.substring(1) &&
            button.id == 3
        ) {
            return { ...button, isSelected: true };
        }
        if (
            userDetails?.name+"/likes" == currentLocation.pathname.substring(1) &&
            button.id == 3
        ) {
            return { ...button, isSelected: true };
        }
        if (
            `/${userDetails?.name}/` + button.name.toLowerCase() == currentLocation.pathname &&
            button.id == 1
        ) {
            return { ...button, isSelected: true };
        }
        return { ...button };
    });

    return (
        <div className="navbar">
            <div className="navbar--logo">
                <BsBugFill />
                Termite
            </div>

            <div className="navbar--button-container">
                {navButtons?.map((prevState) => (
                    <NavButton
                        id={prevState.id}
                        key={prevState.id}
                        name={prevState.name}
                        icon={prevState.icon}
                        handleHover={handleButtonHover}
                        isHover={prevState.isHover}
                        handleClick={handleButtonclick}
                        isSelected={prevState.isSelected}
                        notifs={notifications?.length}
                    />
                ))}
            </div>
        </div>
    );
}
