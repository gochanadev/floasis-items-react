import Head from "next/head";
import Transaction from "../components/Transaction";
import { Auth } from "../components/Auth";
import { Store } from "../components/Store";
import { ITEMS_STORE_NAME } from "../lib/constants";

export default function Buy() {
    return (
        <div>
            <Head>
                <title>{`${ITEMS_STORE_NAME}`} Store</title>
            </Head>
            <Transaction />
            <Auth />
            <Store />
        </div>
    );
}
