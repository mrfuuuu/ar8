/*
    AR8 STUDIO
    YouTube Analytics Frontend

    Backend:
    Railway
*/

const API_BASE =
    "https://ar8-backend-production.up.railway.app";


/* =========================
   ELEMENTS
========================= */

const elements = {
    loginCard: document.getElementById("loginCard"),
    googleLogin: document.getElementById("googleLogin"),
    refreshBtn: document.getElementById("refreshBtn"),
    updateText: document.getElementById("updateText"),

    subscribers: document.getElementById("subscribers"),
    views: document.getElementById("views"),
    watchTime: document.getElementById("watchTime"),
    engagement: document.getElementById("engagement"),

    audienceNumber: document.getElementById("audienceNumber"),
    gained: document.getElementById("gained"),
    lost: document.getElementById("lost"),
    netGrowth: document.getElementById("netGrowth"),

    viewsChart: document.getElementById("viewsChart"),
    videosList: document.getElementById("videosList"),
    videoCount: document.getElementById("videoCount"),

    dateRange: document.getElementById("dateRange"),

    subscriberGrowth:
        document.getElementById("subscriberGrowth"),

    viewGrowth:
        document.getElementById("viewGrowth")
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

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    return new Intl.NumberFormat("en-US").format(number);
}


function formatCompact(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

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


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   CONNECTION STATUS
========================= */

function setConnectionStatus(
    connected,
    text
) {

    if (elements.updateText) {

        elements.updateText.textContent =
            text ||
            (
                connected
                    ? "Connected"
                    : "Not connected"
            );
    }


    const connection =
        document.querySelector(".last-update");


    if (connection) {

        connection.classList.toggle(
            "connected",
            connected
        );
    }


    const sidebarConnection =
        document.querySelector(".connection");


    if (sidebarConnection) {

        const small =
            sidebarConnection.querySelector("small");


        if (small) {

            small.textContent =
                connected
                    ? "YouTube connected"
                    : "Ready to connect";
        }


        const dot =
            sidebarConnection.querySelector(
                ".status-dot"
            );


        if (dot) {

            dot.style.background =
                connected
                    ? "#00ff88"
                    : "#555";
        }
    }
}


/* =========================
   GOOGLE LOGIN
========================= */

if (elements.googleLogin) {

    elements.googleLogin.addEventListener(
        "click",
        () => {

            console.log(
                "Opening Google OAuth..."
            );


            window.location.href =
                `${API_BASE}/api/auth/login`;

        }
    );
}


/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard() {

    console.log(
        "Loading AR8 dashboard..."
    );


    setConnectionStatus(
        false,
        "Connecting..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/api/dashboard`,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        console.log(
            "Dashboard status:",
            response.status
        );


        /* =========================
           NOT AUTHENTICATED
        ========================= */

        if (response.status === 401) {

            setConnectionStatus(
                false,
                "Not connected"
            );


            if (elements.loginCard) {

                elements.loginCard.style.display =
                    "flex";
            }


            return;
        }


        /* =========================
           OTHER ERROR
        ========================= */

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Dashboard error:",
                errorText
            );

            throw new Error(
                `Dashboard request failed: ${response.status}`
            );
        }


        /* =========================
           JSON
        ========================= */

        const data =
            await response.json();


        console.log(
            "AR8 dashboard data:",
            data
        );


        /* =========================
           RENDER
        ========================= */

        renderDashboard(data);


        /* =========================
           SUCCESS
        ========================= */

        if (elements.loginCard) {

            elements.loginCard.style.display =
                "none";
        }


        const updatedText =
            data.updatedAt
                ? `Updated ${new Date(
                    data.updatedAt
                  ).toLocaleTimeString()}`
                : "Connected";


        setConnectionStatus(
            true,
            updatedText
        );


    } catch (error) {

        console.error(
            "AR8 Dashboard Error:",
            error
        );


        setConnectionStatus(
            false,
            "Connection error"
        );
    }
}


/* =========================
   RENDER DASHBOARD
========================= */

function renderDashboard(data) {

    const channel =
        data?.channel || {};

    const analytics =
        data?.analytics || {};


    /* =========================
       CHANNEL
    ========================= */

    if (elements.subscribers) {

        elements.subscribers.textContent =
            formatCompact(
                channel.subscribers
            );
    }


    if (elements.views) {

        elements.views.textContent =
            formatCompact(
                channel.views
            );
    }


    /* =========================
       WATCH TIME
    ========================= */

    if (elements.watchTime) {

        elements.watchTime.textContent =
            analytics.watchTime !== undefined &&
            analytics.watchTime !== null
                ? `${formatNumber(
                    analytics.watchTime
                  )} min`
                : "—";
    }


    /* =========================
       ENGAGEMENT
    ========================= */

    if (elements.engagement) {

        elements.engagement.textContent =
            analytics.engagement !== undefined &&
            analytics.engagement !== null
                ? formatNumber(
                    analytics.engagement
                  )
                : "—";
    }


    /* =========================
       AUDIENCE
    ========================= */

    if (elements.audienceNumber) {

        elements.audienceNumber.textContent =
            formatCompact(
                channel.subscribers
            );
    }


    /* =========================
       GROWTH
    ========================= */

    const gained =
        Number(
            analytics.subscribersGained || 0
        );


    const lost =
        Number(
            analytics.subscribersLost || 0
        );


    if (elements.gained) {

        elements.gained.textContent =
            formatNumber(gained);
    }


    if (elements.lost) {

        elements.lost.textContent =
            formatNumber(lost);
    }


    if (elements.netGrowth) {

        elements.netGrowth.textContent =
            formatNumber(
                gained - lost
            );
    }


    /* =========================
       SMALL TEXT
    ========================= */

    if (elements.subscriberGrowth) {

        elements.subscriberGrowth.textContent =
            "Channel subscribers";
    }


    if (elements.viewGrowth) {

        elements.viewGrowth.textContent =
            "Total channel views";
    }


    /* =========================
       CHART
    ========================= */

    renderChart(
        analytics.dailyViews || []
    );


    /* =========================
       VIDEOS
    ========================= */

    renderVideos(
        data?.videos || []
    );
}


/* =========================
   CHART
========================= */

function renderChart(rows) {

    if (!elements.viewsChart) {
        return;
    }


    elements.viewsChart.innerHTML = "";


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

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
                Number(
                    item?.views || 0
                )
        );


    const max =
        Math.max(
            ...values,
            1
        );


    rows.forEach(item => {

        const value =
            Number(
                item?.views || 0
            );


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


        bar.style.flex =
            "1";


        bar.style.minWidth =
            "4px";


        bar.style.borderRadius =
            "7px 7px 2px 2px";


        bar.style.background =
            "linear-gradient(" +
            "to top," +
            "#ff2020," +
            "rgba(255,32,32,.12)" +
            ")";


        bar.title =
            `${item?.date || ""}: ` +
            `${formatNumber(value)} views`;


        elements.viewsChart.appendChild(
            bar
        );

    });
}


/* =========================
   VIDEOS
========================= */

function renderVideos(videos) {

    if (!elements.videosList) {
        return;
    }


    elements.videosList.innerHTML = "";


    if (elements.videoCount) {

        elements.videoCount.textContent =
            `${videos.length} videos`;
    }


    if (
        !Array.isArray(videos) ||
        videos.length === 0
    ) {

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
                loading="lazy"
            >

            <div class="video-info">

                <h3>
                    ${escapeHtml(
                        video.title ||
                        "Untitled"
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        video.publishedAt ||
                        ""
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
   REFRESH
========================= */

if (elements.refreshBtn) {

    elements.refreshBtn.addEventListener(
        "click",
        async () => {

            elements.refreshBtn.disabled =
                true;


            elements.refreshBtn.style.opacity =
                "0.6";


            try {

                await loadDashboard();

            } finally {

                elements.refreshBtn.disabled =
                    false;

                elements.refreshBtn.style.opacity =
                    "1";
            }

        }
    );
}


/* =========================
   DATE RANGE
========================= */

if (elements.dateRange) {

    elements.dateRange.addEventListener(
        "change",
        () => {

            loadDashboard();

        }
    );
}


/* =========================
   SIDEBAR NAVIGATION
========================= */

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const analyticsPanel =
    document.querySelector(
        ".analytics-panel"
    );


const audiencePanel =
    document.querySelector(
        ".audience-panel"
    );


const videosPanel =
    document.querySelector(
        ".videos-panel"
    );


function activateNav(button) {

    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    button.classList.add(
        "active"
    );
}


function scrollToSection(element) {

    if (!element) {
        return;
    }


    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


navItems.forEach(
    (button, index) => {

        button.addEventListener(
            "click",
            () => {

                activateNav(button);


                /* Dashboard */

                if (index === 0) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                    return;
                }


                /* Analytics */

                if (index === 1) {

                    scrollToSection(
                        analyticsPanel
                    );

                    return;
                }


                /* Videos */

                if (index === 2) {

                    scrollToSection(
                        videosPanel
                    );

                    return;
                }


                /* Audience */

                if (index === 3) {

                    scrollToSection(
                        audiencePanel
                    );

                    return;
                }


                /* Settings */

                if (index === 4) {

                    showSettings();

                }

            }
        );

    }
);


/* =========================
   SETTINGS
========================= */

function showSettings() {

    let modal =
        document.getElementById(
            "ar8SettingsModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "ar8SettingsModal";


        modal.innerHTML = `

            <div
                class="ar8-settings-overlay"
                id="ar8SettingsOverlay"
            >

                <div class="ar8-settings-box">

                    <button
                        class="ar8-settings-close"
                        id="ar8SettingsClose"
                        type="button"
                    >
                        ×
                    </button>

                    <span class="section-label">
                        AR8 STUDIO
                    </span>

                    <h2>
                        Settings
                    </h2>

                    <p>
                        YouTube connection settings
                    </p>

                    <div class="ar8-setting-item">

                        <strong>
                            Backend
                        </strong>

                        <span>
                            Railway
                        </span>

                    </div>

                    <div class="ar8-setting-item">

                        <strong>
                            API Status
                        </strong>

                        <span id="ar8ApiStatus">
                            Checking...
                        </span>

                    </div>

                    <div class="ar8-setting-item">

                        <strong>
                            Backend URL
                        </strong>

                        <span>
                            ar8-backend-production.up.railway.app
                        </span>

                    </div>

                    <button
                        class="google-button"
                        id="ar8LogoutButton"
                        type="button"
                    >
                        Disconnect YouTube
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "ar8SettingsClose"
            )
            .addEventListener(
                "click",
                closeSettings
            );


        document
            .getElementById(
                "ar8SettingsOverlay"
            )
            .addEventListener(
                "click",
                event => {

                    if (
                        event.target.id ===
                        "ar8SettingsOverlay"
                    ) {

                        closeSettings();

                    }

                }
            );


        document
            .getElementById(
                "ar8LogoutButton"
            )
            .addEventListener(
                "click",
                logout
            );

    }


    modal.style.display =
        "block";


    checkApiStatus();
}


/* =========================
   CLOSE SETTINGS
========================= */

function closeSettings() {

    const modal =
        document.getElementById(
            "ar8SettingsModal"
        );


    if (modal) {

        modal.style.display =
            "none";
    }
}


/* =========================
   API STATUS
========================= */

/*
    IMPORTANT:

    Do NOT use /api/health here.

    Your Railway root endpoint is confirmed working:

    https://ar8-backend-production.up.railway.app/

    Therefore we check the ROOT endpoint.
*/

async function checkApiStatus() {

    const status =
        document.getElementById(
            "ar8ApiStatus"
        );


    if (!status) {
        return;
    }


    status.textContent =
        "Checking...";


    try {

        const response =
            await fetch(
                `${API_BASE}/`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (response.ok) {

            status.textContent =
                "Online";

            status.style.color =
                "#00ff88";

        } else {

            status.textContent =
                "Offline";

            status.style.color =
                "#ff4444";
        }


    } catch (error) {

        console.error(
            "API status error:",
            error
        );


        status.textContent =
            "Offline";

        status.style.color =
            "#ff4444";
    }
}


/* =========================
   LOGOUT
========================= */

async function logout() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        console.log(
            "Logout status:",
            response.status
        );


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    /* Show login */

    if (elements.loginCard) {

        elements.loginCard.style.display =
            "flex";
    }


    setConnectionStatus(
        false,
        "Not connected"
    );


    /* Reset stats */

    [
        elements.subscribers,
        elements.views,
        elements.watchTime,
        elements.engagement,
        elements.audienceNumber,
        elements.gained,
        elements.lost,
        elements.netGrowth
    ].forEach(element => {

        if (element) {

            element.textContent =
                "—";
        }

    });


    /* Reset videos */

    if (elements.videosList) {

        elements.videosList.innerHTML = `

            <div class="empty-state">

                <div>▶</div>

                <p>
                    Connect your YouTube channel
                    to load your videos.
                </p>

            </div>

        `;
    }


    if (elements.videoCount) {

        elements.videoCount.textContent =
            "—";
    }


    /* Reset chart */

    if (elements.viewsChart) {

        elements.viewsChart.innerHTML = `

            <div class="chart-empty">
                Connect YouTube to load analytics.
            </div>

        `;
    }


    closeSettings();
}


/* =========================
   START
========================= */

console.log(
    "AR8 Studio frontend loaded."
);

console.log(
    "Backend:",
    API_BASE
);


/*
    Load dashboard automatically.

    If OAuth session exists,
    dashboard data will appear.
*/

loadDashboard();
