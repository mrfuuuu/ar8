/*
=========================================================
AR8 STUDIO
YouTube Analytics Dashboard
Frontend: GitHub Pages
Backend: Railway
=========================================================
*/

"use strict";

/* =====================================================
   CONFIG
===================================================== */

const API_BASE =
    "https://ar8-backend-production.up.railway.app";

const FRONTEND_ORIGIN =
    "https://mrfuuuu.github.io";


/* =====================================================
   ELEMENTS
===================================================== */

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


/* =====================================================
   DEBUG
===================================================== */

function log(...args) {
    console.log("[AR8]", ...args);
}

function errorLog(...args) {
    console.error("[AR8 ERROR]", ...args);
}


/* =====================================================
   FORMAT HELPERS
===================================================== */

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

    if (number >= 1000000000) {
        return (
            (number / 1000000000)
                .toFixed(1)
                .replace(".0", "") + "B"
        );
    }

    if (number >= 1000000) {
        return (
            (number / 1000000)
                .toFixed(1)
                .replace(".0", "") + "M"
        );
    }

    if (number >= 1000) {
        return (
            (number / 1000)
                .toFixed(1)
                .replace(".0", "") + "K"
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


/* =====================================================
   CONNECTION STATUS
===================================================== */

function setConnectionStatus(connected, text) {

    if (elements.updateText) {
        elements.updateText.textContent =
            text ||
            (connected
                ? "Connected"
                : "Not connected");
    }


    const lastUpdate =
        document.querySelector(".last-update");

    if (lastUpdate) {
        lastUpdate.classList.toggle(
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
                    ? "#00d26a"
                    : "#555";
        }
    }
}


/* =====================================================
   RESET DASHBOARD
===================================================== */

function resetDashboard() {

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

    resetElements.forEach(element => {

        if (element) {
            element.textContent = "—";
        }

    });


    if (elements.viewsChart) {

        elements.viewsChart.innerHTML = `
            <div class="chart-empty">
                Connect YouTube to load analytics.
            </div>
        `;
    }


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
            "0 videos";
    }
}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

if (elements.googleLogin) {

    elements.googleLogin.addEventListener(
        "click",
        function () {

            log("Starting Google OAuth...");

            elements.googleLogin.disabled = true;

            elements.googleLogin.style.opacity =
                "0.6";

            window.location.href =
                API_BASE + "/api/auth/login";
        }
    );
}


/* =====================================================
   API REQUEST HELPER
===================================================== */

async function apiRequest(endpoint, options = {}) {

    const url =
        API_BASE + endpoint;

    log("API request:", url);


    const response =
        await fetch(
            url,
            {
                method:
                    options.method || "GET",

                credentials:
                    "include",

                cache:
                    "no-store",

                headers: {
                    "Accept":
                        "application/json",

                    ...(options.headers || {})
                },

                body:
                    options.body
            }
        );


    log(
        "API response:",
        endpoint,
        response.status
    );


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    let data = null;


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    } else {

        const text =
            await response.text();

        data = text;
    }


    if (!response.ok) {

        const message =
            typeof data === "object"
                ? (
                    data.error ||
                    data.message ||
                    `HTTP ${response.status}`
                )
                : data ||
                  `HTTP ${response.status}`;

        throw new Error(message);
    }


    return data;
}


/* =====================================================
   LOAD DASHBOARD
===================================================== */

async function loadDashboard() {

    log("Loading dashboard...");

    setConnectionStatus(
        false,
        "Connecting..."
    );


    try {

        const data =
            await apiRequest(
                "/api/dashboard"
            );


        log(
            "Dashboard data received:",
            data
        );


        if (!data) {
            throw new Error(
                "Backend returned empty response"
            );
        }


        /*
        ===============================================
        RENDER
        ===============================================
        */

        renderDashboard(data);


        /*
        ===============================================
        HIDE LOGIN CARD
        ===============================================
        */

        if (elements.loginCard) {

            elements.loginCard.style.display =
                "none";
        }


        /*
        ===============================================
        CONNECTION STATUS
        ===============================================
        */

        let updateMessage =
            "Connected";


        if (data.updatedAt) {

            const date =
                new Date(
                    data.updatedAt
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                updateMessage =
                    "Updated " +
                    date.toLocaleTimeString();
            }
        }


        setConnectionStatus(
            true,
            updateMessage
        );


        log(
            "Dashboard loaded successfully."
        );

    } catch (error) {

        errorLog(
            "Dashboard loading failed:",
            error
        );


        setConnectionStatus(
            false,
            "Connection error"
        );


        /*
        ===============================================
        SHOW LOGIN CARD
        ===============================================
        */

        if (elements.loginCard) {
            elements.loginCard.style.display =
                "flex";
        }


        /*
        ===============================================
        DO NOT HIDE ACTUAL ERROR
        ===============================================
        */

        if (
            error.message &&
            !error.message
                .toLowerCase()
                .includes("unauthorized")
        ) {

            console.error(
                "AR8 dashboard error:",
                error.message
            );
        }
    }
}


/* =====================================================
   RENDER DASHBOARD
===================================================== */

function renderDashboard(data) {

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
    ===============================================
    SUBSCRIBERS
    ===============================================
    */

    if (elements.subscribers) {

        elements.subscribers.textContent =
            formatCompact(
                channel.subscribers
            );
    }


    /*
    ===============================================
    TOTAL VIEWS
    ===============================================
    */

    if (elements.views) {

        elements.views.textContent =
            formatCompact(
                channel.views
            );
    }


    /*
    ===============================================
    WATCH TIME
    ===============================================
    */

    if (elements.watchTime) {

        if (
            analytics.watchTime !==
                null &&
            analytics.watchTime !==
                undefined
        ) {

            elements.watchTime.textContent =
                formatNumber(
                    analytics.watchTime
                ) + " min";

        } else {

            elements.watchTime.textContent =
                "—";
        }
    }


    /*
    ===============================================
    ENGAGEMENT
    ===============================================
    */

    if (elements.engagement) {

        elements.engagement.textContent =
            formatCompact(
                analytics.engagement
            );
    }


    /*
    ===============================================
    AUDIENCE
    ===============================================
    */

    if (elements.audienceNumber) {

        elements.audienceNumber.textContent =
            formatCompact(
                channel.subscribers
            );
    }


    /*
    ===============================================
    SUBSCRIBERS GAINED
    ===============================================
    */

    const gained =
        Number(
            analytics.subscribersGained || 0
        );


    if (elements.gained) {

        elements.gained.textContent =
            formatNumber(
                gained
            );
    }


    /*
    ===============================================
    SUBSCRIBERS LOST
    ===============================================
    */

    const lost =
        Number(
            analytics.subscribersLost || 0
        );


    if (elements.lost) {

        elements.lost.textContent =
            formatNumber(
                lost
            );
    }


    /*
    ===============================================
    NET GROWTH
    ===============================================
    */

    if (elements.netGrowth) {

        elements.netGrowth.textContent =
            formatNumber(
                gained - lost
            );
    }


    /*
    ===============================================
    GROWTH LABELS
    ===============================================
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
    ===============================================
    DAILY CHART
    ===============================================
    */

    renderChart(
        analytics.dailyViews || []
    );


    /*
    ===============================================
    VIDEOS
    ===============================================
    */

    renderVideos(
        data.videos || []
    );
}


/* =====================================================
   CHART
===================================================== */

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
                value > 0
                    ? (value / max) * 100
                    : 2,
                2
            );


        const bar =
            document.createElement(
                "div"
            );


        bar.style.height =
            height + "%";


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


/* =====================================================
   VIDEOS
===================================================== */

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


/* =====================================================
   REFRESH BUTTON
===================================================== */

if (elements.refreshBtn) {

    elements.refreshBtn.addEventListener(
        "click",
        async function () {

            if (
                elements.refreshBtn.disabled
            ) {
                return;
            }


            log(
                "Manual refresh clicked."
            );


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


/* =====================================================
   DATE RANGE
===================================================== */

if (elements.dateRange) {

    elements.dateRange.addEventListener(
        "change",
        function () {

            log(
                "Date range changed:",
                elements.dateRange.value
            );


            loadDashboard();
        }
    );
}


/* =====================================================
   SIDEBAR NAVIGATION
===================================================== */

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
            function () {

                activateNav(
                    button
                );


                /*
                Dashboard
                */

                if (index === 0) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                    return;
                }


                /*
                Analytics
                */

                if (index === 1) {

                    scrollToSection(
                        analyticsPanel
                    );

                    return;
                }


                /*
                Videos
                */

                if (index === 2) {

                    scrollToSection(
                        videosPanel
                    );

                    return;
                }


                /*
                Audience
                */

                if (index === 3) {

                    scrollToSection(
                        audiencePanel
                    );

                    return;
                }


                /*
                Settings
                */

                if (index === 4) {

                    showSettings();
                }

            }
        );

    }
);


/* =====================================================
   SETTINGS
===================================================== */

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


        /*
        Close
        */

        document
            .getElementById(
                "ar8SettingsClose"
            )
            .addEventListener(
                "click",
                closeSettings
            );


        /*
        Outside click
        */

        document
            .getElementById(
                "ar8SettingsOverlay"
            )
            .addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.id ===
                        "ar8SettingsOverlay"
                    ) {

                        closeSettings();
                    }

                }
            );


        /*
        Logout
        */

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


/* =====================================================
   API STATUS
===================================================== */

async function checkApiStatus() {

    const status =
        document.getElementById(
            "ar8ApiStatus"
        );


    if (!status) {
        return;
    }


    try {

        /*
        Your Railway backend root
        already returns:

        {
            "ok": true,
            "service": "AR8 Studio API"
        }
        */

        const response =
            await fetch(
                API_BASE,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (response.ok) {

            status.textContent =
                "Online";

            status.style.color =
                "#00d26a";

        } else {

            status.textContent =
                "Offline";

            status.style.color =
                "#ff2020";
        }

    } catch (error) {

        errorLog(
            "API status error:",
            error
        );


        status.textContent =
            "Offline";

        status.style.color =
            "#ff2020";
    }
}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    log(
        "Logging out..."
    );


    try {

        await apiRequest(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );

    } catch (error) {

        errorLog(
            "Logout error:",
            error
        );
    }


    /*
    Show login
    */

    if (elements.loginCard) {

        elements.loginCard.style.display =
            "flex";
    }


    /*
    Reset status
    */

    setConnectionStatus(
        false,
        "Not connected"
    );


    /*
    Reset dashboard
    */

    resetDashboard();


    /*
    Close settings
    */

    closeSettings();
}


/* =====================================================
   OAUTH CALLBACK HANDLING
===================================================== */

function handleOAuthCallback() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const connected =
        params.get(
            "connected"
        );


    const error =
        params.get(
            "error"
        );


    if (connected === "true") {

        log(
            "OAuth authorization successful."
        );


        /*
        Remove ?connected=true
        without reloading page
        */

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        return true;
    }


    if (error) {

        errorLog(
            "OAuth error:",
            error
        );


        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }


    return false;
}


/* =====================================================
   START APPLICATION
===================================================== */

async function startApp() {

    log(
        "================================="
    );

    log(
        "AR8 STUDIO starting..."
    );

    log(
        "Frontend:",
        FRONTEND_ORIGIN
    );

    log(
        "Backend:",
        API_BASE
    );

    log(
        "================================="
    );


    /*
    Handle OAuth callback
    */

    const oauthSuccess =
        handleOAuthCallback();


    /*
    Always try dashboard.
    If session exists, data loads.
    If session doesn't exist, login card remains.
    */

    await loadDashboard();


    /*
    If OAuth was successful but
    dashboard failed, log clearly.
    */

    if (oauthSuccess) {

        log(
            "OAuth completed. Dashboard request attempted."
        );
    }
}


/* =====================================================
   RUN
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    startApp
);
