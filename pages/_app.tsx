import { Provider } from "next-auth/client";
import Router, { useRouter } from "next/router";
import NProgress from "nprogress";
import ReactModal from "react-modal";
import { ToastProvider } from "react-toast-notifications";
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import "../styles/nprogress.css";

Router.events.on("routeChangeStart", (url, { shallow }) => {
    if (!shallow) NProgress.start();
});
Router.events.on("routeChangeComplete", (url, { shallow }) => {
    if (!shallow) NProgress.done();
});
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({ Component, pageProps }) {
    const router = useRouter();
    return (
        <Provider session={pageProps.session}>
            <ToastProvider>
                {router.route !== "/" ? <Navbar /> : <div className="mt-20" />}
                <div id="app-root">
                    <Component {...pageProps} />
                </div>
            </ToastProvider>
        </Provider>
    );
}

ReactModal.setAppElement("#app-root");
