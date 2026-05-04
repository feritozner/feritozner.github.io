document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const vcToggleBtn = document.getElementById('vc-theme-toggle');
    const icon = toggleBtn.querySelector('i');
    
    // Mobile Burger Menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    
    hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });

    const savedTheme = localStorage.getItem('portfolio_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    // Load the default page (portfolio) on initial load
    loadPage('portfolio', null);

    // Normal Theme Switcher (Dark/Light)
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = (currentTheme === 'dark' || currentTheme === 'vice-city') ? 'light' : 'dark';
        
        applyTheme(newTheme);
    });

    // Vice City Theme Switcher
    vcToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'vice-city' ? 'light' : 'vice-city';
        
        applyTheme(newTheme);
    });

    function applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('portfolio_theme', themeName);
        updateIcon(themeName);
        updateProfilePic(themeName);
    }

    // Update the theme toggle icon based on the current theme
    function updateIcon(theme) {
        if(theme === 'dark' || theme === 'vice-city') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
});


window.loadPage = async function(pageName, event) {
    const contentDiv = document.getElementById('page-content');
    
    if (event) {
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => link.classList.remove('active'));
        event.target.classList.add('active');

        const navMenu = document.getElementById('nav-links');
        if(navMenu) navMenu.classList.remove('show');
    }

    try {
        const response = await fetch(`pages/${pageName}.html`);
        
        if (response.ok) {
            const html = await response.text();
            contentDiv.innerHTML = html;
            
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (typeof updateProfilePic === 'function') {
                updateProfilePic(currentTheme);
            }

            if (pageName === 'methodology') {
                window.currentZoom = 1;
            }

        } else {
            contentDiv.innerHTML = `
                <div class="box" style="padding: 40px; text-align: center; min-height: 400px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <h2 style="margin-bottom: 10px; color: var(--sev-crit);">Page Not Found (404)</h2>
                </div>
            `;
        }
    } catch (error) {
        contentDiv.innerHTML = '<p style="text-align:center; color:red; padding: 20px;">CORS Error: Please open with Live Server from VS Code.</p>';
    }
};

// Profile picture update function based on theme
window.updateProfilePic = function(theme) {
    const profilePic = document.getElementById('profile-pic');
    if (!profilePic) return; 
    
    if (theme === 'vice-city') {
        profilePic.src = 'assets/vc_pp.png';
    } else {
        profilePic.src = 'assets/pp.jpg';
    }
};

// --- GOOGLE DORKER FUNCTIONS ---
const dorkInfoMessages = {
    'intext': 'Searches for the term only within the text (body) of the page. Ignores HTML tags or URLs.',
    'inurl': 'Searches for the term within the URL of the sites. Ideal for finding vulnerable paths in penetration tests.',
    'intitle': 'Searches for the term in the web page title (<title> tag). Ex: "Index of /"',
    'site': 'Limits the search only to the specified domain or extension. Ex: gov.uk or targetsite.com',
    'numrange': 'Searches within a specific number range. Format: lower_limit..upper_limit (Ex: 1000..2000)',
    'after': 'Returns results added to the Google index after the specified date (YYYY-MM-DD).',
    'cache': 'Opens the most recent cached version of a site taken by Google. Useful for finding deleted content.',
    'allintext': 'Requires ALL of the MULTIPLE words entered to appear in the page text simultaneously.',
    'allinurl': 'Requires ALL of the MULTIPLE words entered to appear in the URL simultaneously.',
    'allintitle': 'Requires ALL of the MULTIPLE words entered to appear in the page title simultaneously.',
    'link': 'Finds other websites that link to the exact URL address you specified.',
    'before': 'Returns results added to the Google index before the specified date (YYYY-MM-DD).',
    'related': 'Finds sites with similar or alternative content to the website you specified.'
};

window.showInfo = function(dorkType) {
    alert(dorkType.toUpperCase() + ":\n\n" + dorkInfoMessages[dorkType]);
};

window.executeDorkSearch = function() {
    let queryParts = [];

    let keywordsRaw = document.getElementById('keywords').value.trim();
    if (keywordsRaw) {
        let formattedKeywords = keywordsRaw.split(',')
            .map(k => {
                let cleanWord = k.trim();
                return cleanWord ? `"${cleanWord}"` : "";
            })
            .filter(k => k !== "")
            .join(' ');
        
        if (formattedKeywords) {
            queryParts.push(formattedKeywords);
        }
    }

    let domain = document.getElementById('targetDomain').value.trim();
    if (domain) {
        queryParts.push(`site:${domain}`);
    }

    const dorkTypes = [
        'intext', 'inurl', 'intitle', 'site', 'cache', 
        'allintext', 'allinurl', 'allintitle', 'link', 'before', 'after', 'related'
    ];

    dorkTypes.forEach(dork => {
        let chk = document.getElementById(`chk-${dork}`);
        let val = document.getElementById(`val-${dork}`);
        if (chk && chk.checked && val && val.value.trim()) {
            queryParts.push(`${dork}:${val.value.trim()}`);
        }
    });

    let chkNum = document.getElementById('chk-numrange');
    let valNum = document.getElementById('val-numrange');
    if (chkNum && chkNum.checked && valNum && valNum.value.trim()) {
        queryParts.push(valNum.value.trim());
    }

    let extParts = [];
    let extCheckboxes = document.querySelectorAll('.ext-chk:checked');
    
    extCheckboxes.forEach(chk => {
        extParts.push(`ext:${chk.value}`);
    });

    let otherExt = document.getElementById('ext-other').value.trim();
    if (otherExt) {
        extParts.push(`ext:${otherExt}`);
    }

    if (extParts.length > 0) {
        if (extParts.length === 1) {
            queryParts.push(extParts[0]);
        } else {
            queryParts.push("(" + extParts.join(" | ") + ")");
        }
    }

    let finalQuery = queryParts.join(" ").trim();
    
    if (finalQuery.length > 0) {
        let googleUrl = "https://www.google.com/search?q=" + encodeURIComponent(finalQuery);
        window.open(googleUrl, '_blank');
    } else {
        alert("Please enter at least one parameter or keyword to search!");
    }
};

// --- METHODOLOGY ZOOM FUNCTIONS ---
window.currentZoom = 1;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.5;

window.zoomSvg = function(action) {
    const zoomWrapper = document.getElementById('svg-zoom-wrapper');
    const zoomText = document.getElementById('zoom-level');
    
    if (!zoomWrapper || !zoomText) return;

    if (action === 'in' && currentZoom < MAX_ZOOM) {
        currentZoom += 0.5;
    } else if (action === 'out' && currentZoom > MIN_ZOOM) {
        currentZoom -= 0.5;
    } else if (action === 'reset') {
        currentZoom = 1;
    }

    currentZoom = Math.min(Math.max(currentZoom, MIN_ZOOM), MAX_ZOOM);

    zoomWrapper.style.width = `${currentZoom * 100}%`;
    
    zoomText.innerText = `${Math.round(currentZoom * 100)}%`;
};

