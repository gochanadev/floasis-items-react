import Head from "next/head";
import "@picocss/pico";
import "../styles/globals.css";
import Link from "next/link";
import AuthProvider from "../contexts/AuthContext";
import TransactionProvider from "../contexts/TransactionContext";
import { 
    ITEMS_STORE_NAME, 
    PRIMARY,
    PRIMARY_FOCUS,
    PRIMARY_HOVER,
    PRIMARY_INVERSE
} from "../lib/constants";
import "../flow/config";

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <meta
                    name={ITEMS_STORE_NAME}
                    content="A decentralized accessories store for the FLOSIS build on Flow!"
                />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <nav className="container header">
                <ul>
                    <li>{ITEMS_STORE_NAME}</li>
                </ul>
                <ul>
                    <li>
                        <Link href="/">
                            <a>Store</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/build">
                            <a>Builder</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/about">
                            <a>About</a>
                        </Link>
                    </li>
                </ul>
            </nav>
            <main className="container">
                <TransactionProvider>
                    <AuthProvider>
                        <Component {...pageProps} />
                    </AuthProvider>
                </TransactionProvider>
            </main>
            <footer className="container">
                <p>
                    visit <a href="https://docs.onflow.org">docs.onflow.org</a> to learn more.
                </p>
                <p>
                    <a href="https://github.com/muttoni/fcl-nextjs-quickstart">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 1024 1024"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                                transform="scale(64)"
                                fill="currentColor"
                            />
                        </svg>
                    </a>
                </p>
            </footer>
            <style global jsx>{`
                /* Green Light scheme (Default) */
                /* Can be forced with data-theme="light" */
                [data-theme="light"],
                :root:not([data-theme="dark"]) {
                    --primary: ${PRIMARY};
                    --primary-hover: ${PRIMARY_HOVER};
                    --primary-focus: ${PRIMARY_FOCUS};
                    --primary-inverse: ${PRIMARY_INVERSE};
                }

                /* Green Dark scheme (Auto) */
                /* Automatically enabled if user has Dark mode enabled */
                @media only screen and (prefers-color-scheme: dark) {
                    :root:not([data-theme="light"]) {
                        --primary: ${PRIMARY};
                        --primary-hover: ${PRIMARY_HOVER};
                        --primary-focus: ${PRIMARY_FOCUS};
                        --primary-inverse: ${PRIMARY_INVERSE};
                    }
                }

                /* Green Dark scheme (Forced) */
                /* Enabled if forced with data-theme="dark" */
                [data-theme="dark"] {
                    --primary: ${PRIMARY};
                    --primary-hover: ${PRIMARY_HOVER};
                    --primary-focus: ${PRIMARY_FOCUS};
                    --primary-inverse: ${PRIMARY_INVERSE};
                }

                /* (Common styles) */
                :root {
                    --form-element-active-border-color: var(--primary);
                    --form-element-focus-color: var(--primary-focus);
                    --switch-color: var(--primary-inverse);
                    --switch-checked-background-color: var(--primary);
                    --primary-green: ${PRIMARY};
                    --primary-yellow: #efee6f;
                    --primary-pink: #ff72de;
                    --cardWidthExtraLarge: 220px;
                    --cardHeightExtraLarge: 280px;
                    --cardWidthLarge: 175px;
                    --cardHeightLarge: 280px;
                    --cardWidthExtraSmall: 80px;
                    --cardHeightExtraSmall: 100px;
                    --colorPickerWidthExtraLarge: 4.25rem;
                    --colorPickerHeightExtraLarge: 4.25rem;
                    --cardMargin: 8px;
                    --colorPickerMargin: 6px;
                    font-family: monospace;
                    font-smooth: never;
                    -webkit-font-smoothing: none;
                }

                button {
                    font-weight: bold;
                }

                h1,
                h2,
                gh3 {
                    margin-bottom: 0;
                }

                article {
                    margin-top: 0;
                }

                article h3 {
                    color: var(--primary-yellow);
                    margin-top: 1rem;
                    margin-bottom: 0.25rem;
                    font-family: monospace;
                }

                footer {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 40px;
                }

                footer.container {
                    margin-top: 5em;
                }

                .container,
                main {
                    margin-top: 0;
                    padding-top: 0;
                }

                .grid {
                    grid-template-areas: " a b ";
                }

                .mb-1 {
                    margin-bottom: 1em;
                }
                .mb-2 {
                    margin-bottom: 2em;
                }

                .accent-border {
                    border: 1px solid var(--primary);
                }

                .container.header {
                    margin-bottom: 30px;
                }

                .cards-section {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .color-pickers-section {
                    display: flex;
                    justify-content: flex-start;
                    flex-wrap: wrap;
                }

                input[type="color"] {
                    appearance: none;
                    border-radius: 5px;
                    box-sizing: border-box;
                    background: transparent;
                    border: 1px solid var(--primary);
                    -moz-appearance: none;
                    -webkit-appearance: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    height: var(--colorPickerHeightExtraLarge);
                    width: var(--colorPickerWidthExtraLarge);
                    margin: var(--colorPickerMargin);
                }

                .card {
                    margin: 0;
                    border: 1px solid var(--primary);
                    border-radius: 5px;
                    margin: 10px 0px;
                    background: transparent;
                    width: var(--cardWidthExtraLarge);
                    height: var(--cardHeightExtraLarge);
                    margin: var(--cardMargin);
                    box-sizing: border-box;
                }

                .card.active {
                    background: var(--primary-focus);
                }

                .tx {
                    margin-bottom: 2em;
                }
                .txId {
                    font-family: monospace;
                    margin-right: 10px;
                }

                .edit-area-content {
                    display: flex;
                    flex-direction: column-reverse;
                }

                .banner {
                    display: flex;
                    flex-direction: column;
                    background-color: var(--primary-focus);
                    align-items: center;
                    transform: rotate(-3deg);
                    margin: 25px;
                    padding-top: 25px;
                    padding-bottom: 25px;
                }

                .banner h1 {
                    font-family: "VT323", monospace;
                    text-shadow: -1px 1px 0 #41ba45, 1px 1px 0 #c63d2b, 1px -1px 0 #42afac, -1px -1px 0 #c6c23f,
                        4px 4px 0px var(--primary-pink), 8px 8px 0px rgba(0, 0, 0, 0.2);
                    color: var(--primary-yellow);
                }

                .banner h2 {
                    font-family: "VT323", monospace;
                    text-shadow: -1px 1px 0 #41ba45, 1px 1px 0 #c63d2b, 1px -1px 0 #42afac, -1px -1px 0 #c6c23f,
                        4px 4px 0px var(--primary-pink), 8px 8px 0px rgba(0, 0, 0, 0.2);
                    color: var(--primary-green);
                }

                .tabs {
                    display: flex;
                    flex-direction: row;
                }

                .tab {
                    overflow: hidden;
                }

                .tabs button {
                    border: none;
                    border-radius: 0px;
                    font-size: 17px;
                    margin-bottom: 0px;
                    border-bottom: 1px solid var(--primary);
                }

                .tabs button:hover {
                    background-color: var(--primary-inverse);
                }

                .tabs button.active {
                    background-color: var(--primary-focus);
                }

                /* THE 'A' AND 'B' IDS ARE USED IN THE UI TO FLIP THE GRID STACKING ORDER FOR MOBILE */
                #a {
                    grid-area: a;
                    margin-top: 3rem;
                }
                #b {
                    grid-area: b;
                    margin-top: 3rem;
                }

                /* BREAKPOINTS: */
                /* Extra small | Small	| Medium | Large  | Extra large */
                /* <576px      | ≥576px | ≥768px | ≥992px | ≥1200px */

                /* UP TO EXTRA LARGE BREAKPOINT */
                @media (max-width: 1200px) {
                    .card {
                        width: var(--cardWidthLarge);
                        height: var(--cardHeightLarge);
                    }
                }

                /* UP TO LARGE BREAKPOINT */
                @media (max-width: 992px) {
                    .grid {
                        grid-template-areas: "b" "a";
                        grid-gap: 1em;
                    }
                    .cards-section {
                        display: block;
                        overflow: auto;
                        white-space: nowrap;
                        padding-bottom: 1rem;
                    }
                }

                /* UP TO EXTRA SMALL BREAKPOINT */
                @media (max-width: 576px) {
                    .card {
                        width: var(--cardWidthExtraSmall);
                        height: var(--cardHeightExtcardWidthExtraSmall);
                    }

                    .cards-section p {
                        font-size: 8px;
                        word-break: break-all;
                        white-space: normal;
                    }
                }

                #left-items {
                    display: flex;
                    align-items: center;
                }

                #inner-text {
                    margin-bottom: 0rem;
                }

                #items-button:hover {
                    background: var(--primary);
                }
            `}</style>
        </div>
    );
}

export default MyApp;
