export const convertirYoutubeAEmbed = (url) => {

    if (!url) return "";

    try {

        // Si ya es un enlace embed
        if (url.includes("/embed/")) {
            return url;
        }

        // https://youtu.be/VIDEO_ID
        if (url.includes("youtu.be/")) {

            const videoId = url.split("youtu.be/")[1].split("?")[0];

            return `https://www.youtube.com/embed/${videoId}`;
        }

        // https://www.youtube.com/watch?v=VIDEO_ID
        if (url.includes("watch?v=")) {

            const videoId = new URL(url).searchParams.get("v");

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        // https://www.youtube.com/shorts/VIDEO_ID
        if (url.includes("/shorts/")) {

            const videoId = url.split("/shorts/")[1].split("?")[0];

            return `https://www.youtube.com/embed/${videoId}`;
        }

        return url;

    } catch {

        return url;
    }
};