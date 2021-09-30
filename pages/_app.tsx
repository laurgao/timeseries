import "../styles/globals.css";
import {Provider} from "next-auth/client";
import ReactModal from "react-modal";
import Navbar from "../components/Navbar";
import NProgress from "nprogress";
import "../styles/nprogress.css";
import Router, {useRouter} from "next/router";

Router.events.on("routeChangeStart", (url, {shallow}) => {
    if (!shallow) NProgress.start();
});
Router.events.on("routeChangeComplete", (url, {shallow}) => {
    if (!shallow) NProgress.done();
});
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({Component, pageProps}) {
    const router = useRouter();
    return (
        <Provider session={pageProps.session}>
            {router.route !== "/" ? <Navbar/> : <div className="mt-20"/>}
            <div id="app-root">
                <Component {...pageProps} />
            </div>
        </Provider>
    );
}

ReactModal.setAppElement("#app-root");