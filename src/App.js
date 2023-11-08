import TitleBar from "./TitleBar";
import Content from "./Content";
import Loading from "./Loading";
import {Auth} from "aws-amplify";
import {useEffect, useState} from "react";

export default function App() {

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Auth.currentAuthenticatedUser().then(() => {
            setIsLoading(false);
        }).catch(() => {
            void Auth.federatedSignIn();
        });
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
        <TitleBar />
        <Content />
        </>
    );
}