```javascript
/*
    AR8 STUDIO
    YouTube Analytics Frontend

    IMPORTANT:
    This file does NOT contain Google secrets.

    The real OAuth/API connection will be added
    through the secure backend in the next step.
*/


const API_BASE = "https://ar8-backend-production.up.railway.app";


const elements = {

    loginCard:
        document.getElementById("loginCard"),

    googleLogin:
        document.getElementById("googleLogin"),

    refreshBtn:
        document.getElementById("refreshBtn"),

    updateText:
        document.getElementById("updateText"),

    subscribers:
        document.getElementById("subscribers"),

    views:
        document.getElementById("views"),

    watchTime:
        document.getElementById("watchTime"),

    engagement:
        document.getElementById("engagement"),

    audienceNumber:
        document.getElementById("audienceNumber"),

    gained:
        document.getElementById("gained"),

    lost:
        document.getElementById("lost"),

    netGrowth:
        document.getElementById("netGrowth"),

    viewsChart:
        document.getElementById("viewsChart"),

    videosList:
        document.getElementById("videosList"),

    videoCount:
        document.getElementById("videoCount"),

    dateRange:
        document.getElementById("dateRange")
};



/* =========================
   HELPERS
========================= */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    return new Intl.NumberFormat(
        "en-US"
    ).format(Number(value));
}


function formatCompact(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    const number = Number(value);

    if (number >= 1000000) {
        return (
            (number / 1000000)
                .toFixed(1)
                .replace(".0", "") +
            "M"
        );
    }

    if (number >= 1000) {
        return (
            (number / 1000)
                .toFixed(1)
                .replace(".0", "") +
            "K"
        );
    }

    return formatNumber(number);
}



/* =========================
   LOGIN
========================= */

elements.googleLogin.addEventListener(
    "click",
    async () => {

        if (
            !API_BASE ||
            API_BASE === "YOUR_BACKEND_URL"
        ) {

            alert(
                "Backend is not connected yet.\n\n" +
                "We will connect Google OAuth " +
                "in the next step."
            );

            return;
        }


        window.location.href =
            `${API_BASE}/auth/login`;
    }
);



/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard() {

    if (
        !API_BASE ||
        API_BASE === "YOUR_BACKEND_URL"
    ) {
        return;
    }


    try {

        elements.updateText.textContent =
            "Loading...";


        const response =
            await fetch(
                `${API_BASE}/api/dashboard`,
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Dashboard request failed."
            );
        }


        const data =
            await response.json();


        renderDashboard(data);


    } catch (error) {

        console.error(error);

        elements.updateText.textContent =
            "Connection error";
    }
}



/* =========================
   RENDER
========================= */

function renderDashboard(data) {

    const channel =
        data.channel || {};

    const analytics =
        data.analytics || {};


    elements.subscribers.textContent =
        formatCompact(
            channel.subscribers
        );


    elements.views.textContent =
        formatCompact(
            channel.views
        );


    elements.watchTime.textContent =
        analytics.watchTime
            ? formatNumber(
                analytics.watchTime
            ) + " min"
            : "—";


    elements.engagement.textContent =
        analytics.engagement !== undefined
            ? formatCompact(
                analytics.engagement
            )
            : "—";


    elements.audienceNumber.textContent =
        formatCompact(
            channel.subscribers
        );


    elements.gained.textContent =
        formatNumber(
            analytics.subscribersGained
        );


    elements.lost.textContent =
        formatNumber(
            analytics.subscribersLost
        );


    const gained =
        Number(
            analytics.subscribersGained || 0
        );

    const lost =
        Number(
            analytics.subscribersLost || 0
        );


    elements.netGrowth.textContent =
        formatNumber(
            gained - lost
        );


    renderChart(
        analytics.dailyViews || []
    );


    renderVideos(
        data.videos || []
    );


    elements.updateText.textContent =
        data.updatedAt
            ? `Updated ${new Date(
                data.updatedAt
              ).toLocaleTimeString()}`
            : "Connected";
}



/* =========================
   CHART
========================= */

function renderChart(rows) {

    elements.viewsChart.innerHTML = "";


    if (!rows.length) {

        elements.viewsChart.innerHTML = `
            <div class="chart-empty">
                No analytics data available.
            </div>
        `;

        return;
    }


    const values =
        rows.map(
            item =>
                Number(item.views || 0)
        );


    const max =
        Math.max(...values, 1);


    rows.forEach(item => {

        const value =
            Number(item.views || 0);


        const height =
            Math.max(
                5,
                (value / max) * 100
            );


        const bar =
            document.createElement(
                "div"
            );


        bar.style.height =
            `${height}%`;


        bar.style.flex = "1";

        bar.style.minWidth = "4px";

        bar.style.borderRadius =
            "7px 7px 2px 2px";

        bar.style.background =
            "linear-gradient(" +
            "to top," +
            "#ff2020," +
            "rgba(255,32,32,.12)" +
            ")";


        bar.title =
            `${item.date}: ${formatNumber(
                value
            )} views`;


        elements.viewsChart.appendChild(
            bar
        );

    });
}



/* =========================
   VIDEOS
========================= */

function renderVideos(videos) {

    elements.videosList.innerHTML = "";

    elements.videoCount.textContent =
        `${videos.length} videos`;


    if (!videos.length) {

        elements.videosList.innerHTML = `
            <div class="empty-state">
                <div>▶</div>
                <p>
                    No video data available.
                </p>
            </div>
        `;

        return;
    }


    videos.forEach(video => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "video-row";


        row.innerHTML = `

            <img
                class="video-thumb"
                src="${escapeHtml(
                    video.thumbnail || ""
                )}"
                alt=""
            >

            <div class="video-info">

                <h3>
                    ${escapeHtml(
                        video.title || "Untitled"
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        video.publishedAt || ""
                    )}
                </p>

            </div>

            <div class="video-views">
                ${formatCompact(
                    video.views
                )} views
            </div>

        `;


        elements.videosList.appendChild(
            row
        );

    });
}



/* =========================
   SAFE TEXT
========================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}



/* =========================
   REFRESH
========================= */

elements.refreshBtn.addEventListener(
    "click",
    () => {

        loadDashboard();

    }
);


elements.dateRange.addEventListener(
    "change",
    () => {

        loadDashboard();

    }
);


/* Initial load */

loadDashboard();
```
