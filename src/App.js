import {useAuth0} from "@auth0/auth0-react";
import Loading from "./Loading";
import TitleBar from "./TitleBar";

export default function App() {

    const {
        isAuthenticated,
        loginWithRedirect,
    } = useAuth0();

    if (isAuthenticated) {
        void loginWithRedirect();
        return <Loading />;
    }

    return (
        <>
        <TitleBar />
        <Loading />
        </>
    );
}