/*
========================================================
AR8 STUDIO
YouTube Analytics Dashboard
Frontend: GitHub Pages
Backend: Railway
========================================================
*/

"use strict";

/* ======================================================
   CONFIG
====================================================== */

const API_BASE =
    "https://ar8-backend-production.up.railway.app";

const FRONTEND_URL =
    "https://mrfuuuu.github.io/ar8";


/* ======================================================
   LOGGING
====================================================== */

function log(...args) {
    console.log("[AR8]", ...args);
}

function errorLog(...args) {
    console.error("[AR8 ERROR]", ...args);
}

log("=================================");
log("AR8 STUDIO starting...");
log("Frontend:", FRONTEND_URL);
log("Backend:", API_BASE);
log("=================================");


/* ======================================================
   DOM
====================================================== */

const $ = (id) => document.getElementById(id);

const elements = {

    loginCard: $("loginCard"),

    googleLogin: $("googleLogin"),

    refreshBtn: $("refreshBtn"),

    updateText: $("updateText"),

    subscribers: $("subscribers"),

    views: $("views"),

    watchTime: $("watchTime"),

    engagement: $("engagement"),

    audienceNumber: $("audienceNumber"),

    gained: $("gained"),

    lost: $("lost"),

    netGrowth: $("netGrowth"),

    viewsChart: $("viewsChart"),

    videosList: $("videosList"),

    videoCount: $("videoCount"),

    dateRange: $("dateRange"),

    subscriberGrowth: $("subscriberGrowth"),

    viewGrowth: $("viewGrowth")
};


/* ======================================================
   FORMATTERS
====================================================== */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
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

    if (!Number.isFinite(number)) {
        return "—";
    }

    if (number >= 1000000000) {
        return (
            (number / 1000000000)
                .toFixed(1)
                .replace(".0", "") +
            "B"
        );
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


/* ======================================================
   CONNECTION STATUS
====================================================== */

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


    const lastUpdate =
        document.querySelector(".last-update");


    if (lastUpdate) {

        lastUpdate.classList.toggle(
            "connected",
            connected
        );
    }


    const statusDot =
        document.querySelector(
            ".last-update .status-dot"
        );


    if (statusDot) {

        statusDot.style.background =
            connected
                ? "#22c55e"
                : "#555";
    }


    const sidebar =
        document.querySelector(".connection");


    if (sidebar) {

        const small =
            sidebar.querySelector("small");


        if (small) {

            small.textContent =
                connected
                    ? "YouTube connected"
                    : "Ready to connect";
        }


        const dot =
            sidebar.querySelector(
                ".status-dot"
            );


        if (dot) {

            dot.style.background =
                connected
                    ? "#22c55e"
                    : "#555";
        }
    }
}


/* ======================================================
   API REQUEST
====================================================== */

async function apiRequest(
    endpoint,
    options = {}
) {

    const url =
        `${API_BASE}${endpoint}`;

    log("API request:", url);


    const response =
        await fetch(
            url,
            {
                ...options,

                credentials: "include",

                headers: {
                    "Accept":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );


    log(
        "API response:",
        response.status,
        endpoint
    );


    if (response.status === 401) {

        return {
            unauthorized: true,
            response
        };
    }


    if (!response.ok) {

        let message =
            `HTTP ${response.status}`;

        try {

            const body =
                await response.json();

            if (body?.error) {
                message = body.error;
            }

        } catch {
            // Ignore JSON parse error
        }


        throw new Error(message);
    }


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        !contentType.includes(
            "application/json"
        )
    ) {

        throw new Error(
            "Backend did not return JSON."
        );
    }


    return {
        unauthorized: false,
        data: await response.json()
    };
}


/* ======================================================
   GOOGLE LOGIN
====================================================== */

if (elements.googleLogin) {

    elements.googleLogin.addEventListener(
        "click",
        () => {

            log(
                "Starting Google OAuth..."
            );


            /*
             * IMPORTANT
             * Backend OAuth route
             */

            window.location.href =
                `${API_BASE}/api/auth/login`;
        }
    );
}


/* ======================================================
   LOAD DASHBOARD
====================================================== */

async function loadDashboard() {

    log("Loading dashboard...");


    setConnectionStatus(
        false,
        "Connecting..."
    );


    try {

        const result =
            await apiRequest(
                "/api/dashboard"
            );


        /*
         * User is not authenticated
         */

        if (result.unauthorized) {

            log(
                "Dashboard: user is not authenticated."
            );


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


        /*
         * Successful response
         */

        const data =
            result.data;


        log(
            "Dashboard data received:",
            data
        );


        renderDashboard(data);


        /*
         * Hide Google login card
         */

        if (elements.loginCard) {

            elements.loginCard.style.display =
                "none";
        }


        const updated =
            data?.updatedAt;


        if (updated) {

            const date =
                new Date(updated);


            setConnectionStatus(
                true,
                `Updated ${date.toLocaleTimeString()}`
            );

        } else {

            setConnectionStatus(
                true,
                "Connected"
            );
        }


    } catch (error) {

        errorLog(
            "Dashboard loading failed:",
            error
        );


        setConnectionStatus(
            false,
            "Connection error"
        );
    }
}


/* ======================================================
   RENDER DASHBOARD
====================================================== */

function renderDashboard(data) {

    if (!data) {
        errorLog(
            "No dashboard data received."
        );
        return;
    }


    const channel =
        data.channel || {};


    const analytics =
        data.analytics || {};


    log(
        "Rendering channel:",
        channel
    );


    log(
        "Rendering analytics:",
        analytics
    );


    /*
     * SUBSCRIBERS
     */

    if (elements.subscribers) {

        elements.subscribers.textContent =
            formatCompact(
                channel.subscribers
            );
    }


    /*
     * VIEWS
     */

    if (elements.views) {

        elements.views.textContent =
            formatCompact(
                channel.views
            );
    }


    /*
     * WATCH TIME
     */

    if (elements.watchTime) {

        elements.watchTime.textContent =
            analytics.watchTime !==
                undefined &&
            analytics.watchTime !==
                null
                ? `${formatNumber(
                    analytics.watchTime
                  )} min`
                : "—";
    }


    /*
     * ENGAGEMENT
     */

    if (elements.engagement) {

        elements.engagement.textContent =
            analytics.engagement !==
                undefined
                ? formatCompact(
                    analytics.engagement
                  )
                : "—";
    }


    /*
     * AUDIENCE
     */

    if (elements.audienceNumber) {

        elements.audienceNumber.textContent =
            formatCompact(
                channel.subscribers
            );
    }


    /*
     * GAINED / LOST
     */

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


    /*
     * SMALL STAT TEXT
     */

    if (elements.subscriberGrowth) {

        elements.subscriberGrowth.textContent =
            "Channel subscribers";
    }


    if (elements.viewGrowth) {

        elements.viewGrowth.textContent =
            "Total channel views";
    }


    /*
     * CHART
     */

    renderChart(
        analytics.dailyViews || []
    );


    /*
     * VIDEOS
     */

    renderVideos(
        data.videos || []
    );
}


/* ======================================================
   CHART
====================================================== */

function renderChart(rows) {

    if (!elements.viewsChart) {
        return;
    }


    elements.viewsChart.innerHTML =
        "";


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


/* ======================================================
   VIDEOS
====================================================== */

function renderVideos(videos) {

    if (!elements.videosList) {
        return;
    }


    elements.videosList.innerHTML =
        "";


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


/* ======================================================
   REFRESH BUTTON
====================================================== */

if (elements.refreshBtn) {

    elements.refreshBtn.addEventListener(
        "click",
        async () => {

            log(
                "Refresh button clicked."
            );


            elements.refreshBtn.disabled =
                true;


            const original =
                elements.refreshBtn.textContent;


            elements.refreshBtn.textContent =
                "↻";


            try {

                await loadDashboard();

            } finally {

                elements.refreshBtn.disabled =
                    false;


                elements.refreshBtn.textContent =
                    original;
            }

        }
    );
}


/* ======================================================
   DATE RANGE
====================================================== */

if (elements.dateRange) {

    elements.dateRange.addEventListener(
        "change",
        () => {

            log(
                "Date range:",
                elements.dateRange.value
            );


            /*
             * Current backend returns
             * its available analytics range.
             *
             * When backend supports ?days=
             * this can be extended.
             */

            loadDashboard();
        }
    );
}


/* ======================================================
   SIDEBAR NAVIGATION
====================================================== */

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


function scrollToSection(
    element
) {

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


                /*
                 * Dashboard
                 */

                if (index === 0) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                    return;
                }


                /*
                 * Analytics
                 */

                if (index === 1) {

                    scrollToSection(
                        analyticsPanel
                    );

                    return;
                }


                /*
                 * Videos
                 */

                if (index === 2) {

                    scrollToSection(
                        videosPanel
                    );

                    return;
                }


                /*
                 * Audience
                 */

                if (index === 3) {

                    scrollToSection(
                        audiencePanel
                    );

                    return;
                }


                /*
                 * Settings
                 */

                if (index === 4) {

                    showSettings();
                }

            }
        );

    }
);


/* ======================================================
   SETTINGS
====================================================== */

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


        const close =
            document.getElementById(
                "ar8SettingsClose"
            );


        if (close) {

            close.addEventListener(
                "click",
                closeSettings
            );
        }


        const overlay =
            document.getElementById(
                "ar8SettingsOverlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeSettings();
                    }

                }
            );
        }


        const logoutButton =
            document.getElementById(
                "ar8LogoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );
        }
    }


    modal.style.display =
        "block";


    checkApiStatus();
}


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


/* ======================================================
   API STATUS
====================================================== */

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
                `${API_BASE}/api/health`,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (response.ok) {

            status.textContent =
                "Online";

        } else {

            status.textContent =
                `Offline (${response.status})`;
        }


    } catch (error) {

        errorLog(
            "Health check failed:",
            error
        );


        status.textContent =
            "Offline";
    }
}


/* ======================================================
   LOGOUT
====================================================== */

async function logout() {

    log(
        "Disconnecting YouTube..."
    );


    try {

        await fetch(
            `${API_BASE}/api/auth/logout`,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );

    } catch (error) {

        errorLog(
            "Logout error:",
            error
        );
    }


    /*
     * Show login card
     */

    if (elements.loginCard) {

        elements.loginCard.style.display =
            "flex";
    }


    /*
     * Reset status
     */

    setConnectionStatus(
        false,
        "Not connected"
    );


    /*
     * Reset statistics
     */

    const resetElements = [

        elements.subscribers,

        elements.views,

        elements.watchTime,

        elements.engagement,

        elements.audienceNumber,

        elements.gained,

        elements.lost,

        elements.netGrowth
    ];


    resetElements.forEach(
        element => {

            if (element) {

                element.textContent =
                    "—";
            }

        }
    );


    /*
     * Reset videos
     */

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


    /*
     * Close settings
     */

    closeSettings();
}


/* ======================================================
   START APPLICATION
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        log(
            "AR8 frontend loaded."
        );


        loadDashboard();

    }
);
