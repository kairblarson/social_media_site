import Timeline from "./Timeline";
import Navbar from "./Navbar";
import Extra from "./Extra";
import PostModal from "./PostModal";
import Header from "./Header";

//nav done //local done
export default function Home(props) {
    
    return (
        <div className="home">
            <Navbar />
            <div>
                <Header />
                <Timeline
                    modalState={props.modalState}
                    openModal={props.toggleModal}
                    isAuth={props.isAuth}
                />
            </div>
            <Extra
                modalState={props.modalState}
                openModal={props.toggleModal}
                isAuth={props.isAuth}
                triggerUpdate={props.triggerUpdate}
            />
            <PostModal
                open={props.modalState}
                closeModal={props.toggleModal}
                onSubmit={props.handleSubmit}
                targetPost={props.targetPost}
            />
        </div>
    );
}
