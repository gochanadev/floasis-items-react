import Head from "next/head";
import { Builder } from "../components/Builder";
import Transaction from "../components/Transaction";
import { Auth } from "../components/Auth";
import { ITEMS_STORE_NAME } from "../lib/constants";

export default function Build() {
    return (
        <div>
            <Head>
                <title>{`${ITEMS_STORE_NAME}`} Builder</title>
            </Head>
            <Transaction />
            <Auth />
            <Builder />
        </div>
    );
}
