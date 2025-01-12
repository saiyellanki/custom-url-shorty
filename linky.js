// script.js
class URLShortener {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadHistory();
        this.baseUrl = window.location.origin + '/';
    }

    initializeElements() {
        this.longUrlInput = document.getElementById('longUrl');
        this.shortenBtn = document.getElementById('shortenBtn');
        this.resultDiv = document.getElementById('result');
        this.customAliasInput = document.getElementById('customAlias');
        this.updateBtn = document.getElementById('updateBtn');
        this.shortUrlInput = document.getElementById('shortUrl');
        this.copyBtn = document.getElementById('copyBtn');
        this.qrBtn = document.getElementById('qrBtn');
        this.qrCode = document.getElementById('qrCode');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.toast = document.getElementById('toast');
    }

    attachEventListeners() {
        this.shortenBtn.addEventListener('click', () => this.shortenUrl());
        this.updateBtn.addEventListener('click', () => this.updateCustomAlias());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.qrBtn.addEventListener('click', () => this.toggleQRCode());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.longUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.shortenUrl();
        });
    }

    shortenUrl() {
        const longUrl = this.longUrlInput.value.trim();
        
        if (!this.isValidUrl(longUrl)) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        const shortCode = this.generateShortCode();
        const shortUrl = this.baseUrl + shortCode;

        this.displayResult(shortUrl, shortCode);
        this.addToHistory(longUrl, shortUrl);
        this.showToast('URL shortened successfully!');
    }

    updateCustomAlias() {
        const customAlias = this.customAliasInput.value.trim();
        
        if (!customAlias) {
            this.showToast('Please enter a custom alias', 'error');
            return;
        }

        if (!this.isValidAlias(customAlias)) {
            this.showToast('Invalid custom alias. Use only letters, numbers, and hyphens', 'error');
            return;
        }

        const shortUrl = this.baseUrl + customAlias;
        this.shortUrlInput.value = shortUrl;
        this.updateHistory(this.longUrlInput.value.trim(), shortUrl);
        this.showToast('Custom URL updated!');
    }

    displayResult(shortUrl, shortCode) {
        this.resultDiv.classList.add('active');
        this.shortUrlInput.value = shortUrl;
        this.customAliasInput.value = shortCode;
        this.qrCode.classList.remove('active');
    }

    toggleQRCode() {
        this.qrCode.classList.toggle('active');
        if (this.qrCode.classList.contains('active')) {
            this.qrCode.innerHTML = '';
            new QRCode(this.qrCode, {
                text: this.shortUrlInput.value,
                width: 128,
                height: 128
            });
        }
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.shortUrlInput.value);
            this.showToast('Copied to clipboard!');
        } catch (err) {
            this.showToast('Failed to copy', 'error');
        }
    }

    addToHistory(longUrl, shortUrl) {
        const history = this.getHistory();
        history.unshift({ longUrl, shortUrl, date: new Date().toISOString() });
        localStorage.setItem('urlHistory', JSON.stringify(history.slice(0, 10)));
        this.displayHistory();
    }

    updateHistory(longUrl, newShortUrl) {
        const history = this.getHistory();
        const index = history.findIndex(item => item.longUrl === longUrl);
        if (index !== -1) {
            history[index].shortUrl = newShortUrl;
            localStorage.setItem('urlHistory', JSON.stringify(history));
            this.displayHistory();
        }
    }

    clearHistory() {
        localStorage.removeItem('urlHistory');
        this.displayHistory();
        this.showToast('History cleared!');
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('urlHistory')) || [];
        } catch {
            return [];
        }
    }

    loadHistory() {
        this.displayHistory();
    }

    displayHistory() {
        const history = this.getHistory();
        this.historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="url-info">
                    <div>${this.truncateUrl(item.longUrl)}</div>
                    <small>${this.truncateUrl(item.shortUrl)}</small>
                </div>
                <div class="button-group">
                    <button onclick="urlShortener.copyHistoryUrl('${item.shortUrl}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="urlShortener.generateQRCode('${item.shortUrl}')">
                        <i class="fas fa-qrcode"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateQRCode(url) {
        this.shortUrlInput.value = url;
        this.resultDiv.classList.add('active');
        this.qrCode.classList.add('active');
        this.qrCode.innerHTML = '';
        new QRCode(this.qrCode, {
            text: url,
            width: 128,
            height: 128
        });
    }

    async copyHistoryUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('Copied to clipboard!');
        } catch (err) {
            this.showToast('Failed to copy', 'error');
        }
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.style.display = 'block';
        this.toast.style.background = type === 'success' ? '#4caf50' : '#f44336';
        
        setTimeout(() => {
            this.toast.style.display = 'none';
        }, 3000);
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    isValidAlias(alias) {
        return /^[a-zA-Z0-9-]+$/.test(alias);
    }

    generateShortCode() {
        return Math.random().toString(36).substr(2, 6);
    }

    truncateUrl(url) {
        return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }
}

// Initialize the application
const urlShortener = new URLShortener();
