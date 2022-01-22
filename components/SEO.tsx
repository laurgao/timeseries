import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

export default function SEO({
                                  title = "Timeseries",
                                  description = "Take notes that are only related to each other by their chronology.",
                                  imgUrl = null,
                                  authorUsername = null,
                                  publishedDate = null,
                                  noindex = false,
                              }: { title?: string, description?: string, imgUrl?: string, authorUsername?: string, publishedDate?: string, noindex?: boolean }) {
    const router = useRouter();
    const fullTitle = title + (router.asPath === "/" ? "" : " | YourApp");

    let openGraph = {
        title: fullTitle,
        description: description,
        url: "https://your-domain.com" + router.asPath,
        images: imgUrl ? [
            { url: imgUrl }
        ] : [
            { url: "https://your-domain.com/defaultImage.png" }
        ],
    };

    let twitter = {
        site: "@your-at",
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
