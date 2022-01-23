import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

export default function SEO({
    title = "",
    description = "Take notes that are only related to each other by their chronology.",
    imgUrl = null,
    authorUsername = null,
    publishedDate = null,
    noindex = false,
}: { title?: string, description?: string, imgUrl?: string, authorUsername?: string, publishedDate?: string, noindex?: boolean }) {
    const router = useRouter();
    let fullTitle;
    if (title) fullTitle = title + " | Timeseries";
    else fullTitle = "Timeseries: take notes that are only related to each other by their chronology."

    let openGraph = {
        title: fullTitle,
        description: description,
        url: "https://timeseries.vercel.app" + router.asPath,
        images: imgUrl ? [
            { url: imgUrl }
        ] : [
            { url: "/hero.png" }
        ],
    };

    let twitter = {
        site: "@laurgao",
        cardType: imgUrl ? "summary_large_image" : "summary",
    };

    return (
        <NextSeo
            title={fullTitle}
            description={description}
            openGraph={openGraph}
            twitter={twitter}
            noindex={noindex}
        />
    );
}
