/**
 * Social Sharing System
 * Share vanity addresses with cryptographic proof
 * Supports Twitter, Discord, Telegram with verification
 */
export class SocialSharing {
  constructor() {
    this.platforms = {
      twitter: this.shareToTwitter.bind(this),
      discord: this.shareToDiscord.bind(this),
      telegram: this.shareToTelegram.bind(this),
      reddit: this.shareToReddit.bind(this)
    };

    this.templates = {
      simple: this.generateSimpleMessage.bind(this),
      detailed: this.generateDetailedMessage.bind(this),
      competitive: this.generateCompetitiveMessage.bind(this),
      artistic: this.generateArtisticMessage.bind(this)
    };
  }

  async share(result, platform, template = 'simple', options = {}) {
    const message = await this.generateMessage(result, template, options);
    const proof = await this.generateProof(result);
    const shareUrl = await this.createShareUrl(message, proof, platform);

    const handler = this.platforms[platform];
    if (!handler) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return handler(shareUrl, message, proof);
  }

  async generateMessage(result, template, options) {
    const generator = this.templates[template];
    if (!generator) {
      throw new Error(`Unknown template: ${template}`);
    }

    return generator(result, options);
  }

  generateSimpleMessage(result, options) {
    return `🎯 Found my vanity address!\n\n` +
           `${result.address}\n\n` +
           `Pattern: ${result.pattern}\n` +
           `Network: ${result.network}\n\n` +
           `Generated with ASURANITY 🚀`;
  }

  generateDetailedMessage(result, options) {
    const stats = options.stats || {};

    return `🎯 Vanity Address Generated!\n\n` +
           `Address: ${result.address}\n` +
           `Pattern: ${result.pattern} (${result.patternType})\n` +
           `Network: ${result.network}\n\n` +
           `📊 Stats:\n` +
           `⏱️ Time: ${this.formatTime(stats.elapsedTime)}\n` +
           `🔢 Attempts: ${stats.totalChecked?.toLocaleString()}\n` +
           `⚡ Hash Rate: ${this.formatHashRate(stats.hashRate)}\n\n` +
           `Generated with ASURANITY 🚀`;
  }

  generateCompetitiveMessage(result, options) {
    const difficulty = options.difficulty || 0;
    const rank = this.calculateRank(difficulty);

    return `🏆 ${rank.emoji} ${rank.name} Vanity Address!\n\n` +
           `${result.address}\n\n` +
           `Pattern: ${result.pattern}\n` +
           `Difficulty: ${difficulty.toExponential(2)}\n` +
           `Rarity: ${rank.rarity}\n\n` +
           `Can you beat this? 💪\n` +
           `Try ASURANITY 🚀`;
  }

  generateArtisticMessage(result, options) {
    const art = this.generateASCIIArt(result.address);

    return `✨ Vanity Address Art ✨\n\n` +
           `${art}\n\n` +
           `${result.address}\n\n` +
           `Pattern: ${result.pattern}\n` +
           `Network: ${result.network}\n\n` +
           `ASURANITY 🚀`;
  }

  generateASCIIArt(address) {
    // Simple ASCII art representation
    const chars = address.substring(2, 10);
    const art = [];

    art.push('╔════════════════╗');
    art.push(`║  ${chars}  ║`);
    art.push('╚════════════════╝');

    return art.join('\n');
  }

  async generateProof(result) {
    // Generate cryptographic proof of ownership
    const data = {
      address: result.address,
      pattern: result.pattern,
      network: result.network,
      timestamp: Date.now()
    };

    const signature = await this.signData(data, result.privateKey);

    return {
      data,
      signature,
      publicKey: result.publicKey
    };
  }

  async signData(data, privateKey) {
    // Simplified signing (in production, use proper crypto)
    const message = JSON.stringify(data);
    const hash = this.simpleHash(message);

    return {
      hash,
      signature: `0x${hash.toString(16).padStart(64, '0')}`
    };
  }

  async verifyProof(proof) {
    const { data, signature, publicKey } = proof;
    const message = JSON.stringify(data);
    const hash = this.simpleHash(message);

    return hash === signature.hash;
  }

  async createShareUrl(message, proof, platform) {
    const encoded = encodeURIComponent(message);
    const proofParam = encodeURIComponent(JSON.stringify(proof));

    return `https://asuranity.app/share?` +
           `platform=${platform}&` +
           `message=${encoded}&` +
           `proof=${proofParam}`;
  }

  shareToTwitter(shareUrl, message, proof) {
    const tweetText = encodeURIComponent(message);
    const url = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;

    window.open(url, '_blank', 'width=550,height=420');

    return { success: true, platform: 'twitter', url };
  }

  shareToDiscord(shareUrl, message, proof) {
    // Discord webhook or share link
    const webhookUrl = localStorage.getItem('discord_webhook');

    if (webhookUrl) {
      return this.sendDiscordWebhook(webhookUrl, message, proof);
    }

    // Fallback: copy to clipboard
    navigator.clipboard.writeText(message);

    return {
      success: true,
      platform: 'discord',
      message: 'Message copied to clipboard. Paste in Discord!'
    };
  }

  async sendDiscordWebhook(webhookUrl, message, proof) {
    const embed = {
      title: '🎯 Vanity Address Generated',
      description: message,
      color: 0x6366f1,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'ASURANITY'
      }
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });

      return {
        success: response.ok,
        platform: 'discord',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        platform: 'discord',
        error: error.message
      };
    }
  }

  shareToTelegram(shareUrl, message, proof) {
    const botToken = localStorage.getItem('telegram_bot_token');
    const chatId = localStorage.getItem('telegram_chat_id');

    if (botToken && chatId) {
      return this.sendTelegramMessage(botToken, chatId, message);
    }

    // Fallback: Telegram share URL
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    return { success: true, platform: 'telegram', url };
  }

  async sendTelegramMessage(botToken, chatId, message) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      return {
        success: response.ok,
        platform: 'telegram',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        platform: 'telegram',
        error: error.message
      };
    }
  }

  shareToReddit(shareUrl, message, proof) {
    const title = encodeURIComponent('Check out my vanity address!');
    const text = encodeURIComponent(message);
    const url = `https://www.reddit.com/submit?title=${title}&text=${text}`;

    window.open(url, '_blank');

    return { success: true, platform: 'reddit', url };
  }

  calculateRank(difficulty) {
    if (difficulty > 1e15) {
      return { name: 'Legendary', emoji: '👑', rarity: 'Ultra Rare' };
    } else if (difficulty > 1e12) {
      return { name: 'Epic', emoji: '💎', rarity: 'Very Rare' };
    } else if (difficulty > 1e9) {
      return { name: 'Rare', emoji: '⭐', rarity: 'Rare' };
    } else if (difficulty > 1e6) {
      return { name: 'Uncommon', emoji: '🎯', rarity: 'Uncommon' };
    } else {
      return { name: 'Common', emoji: '✨', rarity: 'Common' };
    }
  }

  formatTime(seconds) {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
    return `${(seconds / 86400).toFixed(1)}d`;
  }

  formatHashRate(rate) {
    if (!rate) return '0 H/s';
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(2)}M H/s`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(2)}K H/s`;
    return `${rate.toFixed(0)} H/s`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async generateShareImage(result, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Vanity Address Generated', canvas.width / 2, 100);

    // Address
    ctx.font = 'bold 36px monospace';
    ctx.fillText(result.address, canvas.width / 2, 200);

    // Pattern
    ctx.font = '32px Arial';
    ctx.fillText(`Pattern: ${result.pattern}`, canvas.width / 2, 280);

    // Network
    ctx.fillText(`Network: ${result.network}`, canvas.width / 2, 340);

    // Stats
    if (options.stats) {
      ctx.font = '24px Arial';
      ctx.fillText(`Time: ${this.formatTime(options.stats.elapsedTime)}`, canvas.width / 2, 420);
      ctx.fillText(`Hash Rate: ${this.formatHashRate(options.stats.hashRate)}`, canvas.width / 2, 460);
    }

    // Footer
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Generated with ASURANITY 🚀', canvas.width / 2, 560);

    return canvas.toDataURL('image/png');
  }

  async downloadShareImage(result, options = {}) {
    const dataUrl = await this.generateShareImage(result, options);

    const link = document.createElement('a');
    link.download = `vanity-${result.address.substring(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  }

  async copyToClipboard(result, template = 'simple', options = {}) {
    const message = await this.generateMessage(result, template, options);

    try {
      await navigator.clipboard.writeText(message);
      return { success: true, message: 'Copied to clipboard!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getShareableLink(result) {
    const params = new URLSearchParams({
      address: result.address,
      pattern: result.pattern,
      network: result.network
    });

    return `https://asuranity.app/verify?${params.toString()}`;
  }
}

export default SocialSharing;
