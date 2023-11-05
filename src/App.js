import TitleBar from "./TitleBar";
import Content from "./Content";

export default function App() {

    // FIXME: UNCOMMENT THIS BEFORE PROD
    // const {
    //     isAuthenticated,
    //     loginWithRedirect,
    // } = useAuth0();
    //
    // if (!isAuthenticated) {
    //     void loginWithRedirect();
    //     return <Loading />;
    // }

    return (
        <>
        <TitleBar />
        <Content />
        </>
    );
}