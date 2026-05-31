/**
 * Pattern Marketplace
 * Buy, sell, and trade rare vanity patterns
 * Includes escrow, reputation system, and pattern verification
 */
export class PatternMarketplace {
  constructor() {
    this.listings = new Map();
    this.offers = new Map();
    this.transactions = [];
    this.reputation = new Map();
    this.escrow = new Map();

    this.categories = {
      legendary: { minDifficulty: 1e15, fee: 0.01 },
      epic: { minDifficulty: 1e12, fee: 0.02 },
      rare: { minDifficulty: 1e9, fee: 0.03 },
      uncommon: { minDifficulty: 1e6, fee: 0.05 }
    };

    this.loadFromStorage();
  }

  async createListing(pattern, details) {
    const listing = {
      id: this.generateId(),
      pattern: pattern.pattern,
      type: pattern.type,
      network: pattern.network,
      address: pattern.address,
      privateKey: this.encryptPrivateKey(pattern.privateKey),
      seller: details.seller,
      price: details.price,
      currency: details.currency || 'ETH',
      category: this.categorizePattern(pattern),
      difficulty: this.calculateDifficulty(pattern),
      description: details.description || '',
      tags: details.tags || [],
      created: Date.now(),
      status: 'active',
      views: 0,
      offers: []
    };

    // Verify ownership
    if (!await this.verifyOwnership(listing)) {
      throw new Error('Cannot verify pattern ownership');
    }

    this.listings.set(listing.id, listing);
    await this.saveToStorage();

    return listing;
  }

  async makeOffer(listingId, offerDetails) {
    const listing = this.listings.get(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.status !== 'active') {
      throw new Error('Listing not active');
    }

    const offer = {
      id: this.generateId(),
      listingId,
      buyer: offerDetails.buyer,
      amount: offerDetails.amount,
      currency: offerDetails.currency || listing.currency,
      message: offerDetails.message || '',
      created: Date.now(),
      status: 'pending',
      expiresAt: Date.now() + (offerDetails.expiryHours || 24) * 3600000
    };

    this.offers.set(offer.id, offer);
    listing.offers.push(offer.id);

    await this.saveToStorage();

    return offer;
  }

  async acceptOffer(offerId) {
    const offer = this.offers.get(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    const listing = this.listings.get(offer.listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    // Create escrow
    const escrowId = await this.createEscrow(listing, offer);

    offer.status = 'accepted';
    offer.escrowId = escrowId;
    listing.status = 'in_escrow';

    await this.saveToStorage();

    return { offer, escrowId };
  }

  async createEscrow(listing, offer) {
    const escrowId = this.generateId();

    const escrow = {
      id: escrowId,
      listingId: listing.id,
      offerId: offer.id,
      seller: listing.seller,
      buyer: offer.buyer,
      amount: offer.amount,
      currency: offer.currency,
      pattern: listing.pattern,
      privateKey: listing.privateKey,
      created: Date.now(),
      status: 'pending_payment',
      releaseConditions: {
        buyerConfirms: false,
        sellerConfirms: false,
        timeoutHours: 72
      }
    };

    this.escrow.set(escrowId, escrow);
    await this.saveToStorage();

    return escrowId;
  }

  async confirmPayment(escrowId, party) {
    const escrow = this.escrow.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (party === 'buyer') {
      escrow.releaseConditions.buyerConfirms = true;
    } else if (party === 'seller') {
      escrow.releaseConditions.sellerConfirms = true;
    }

    // Both parties confirmed - release
    if (escrow.releaseConditions.buyerConfirms && escrow.releaseConditions.sellerConfirms) {
      await this.releaseEscrow(escrowId);
    }

    await this.saveToStorage();
  }

  async releaseEscrow(escrowId) {
    const escrow = this.escrow.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    // Transfer pattern to buyer
    const privateKey = this.decryptPrivateKey(escrow.privateKey);

    const transaction = {
      id: this.generateId(),
      escrowId,
      listingId: escrow.listingId,
      seller: escrow.seller,
      buyer: escrow.buyer,
      amount: escrow.amount,
      currency: escrow.currency,
      pattern: escrow.pattern,
      privateKey: privateKey,
      timestamp: Date.now(),
      fee: this.calculateFee(escrow.amount)
    };

    this.transactions.push(transaction);

    // Update reputation
    this.updateReputation(escrow.seller, 'sale');
    this.updateReputation(escrow.buyer, 'purchase');

    // Update listing
    const listing = this.listings.get(escrow.listingId);
    if (listing) {
      listing.status = 'sold';
    }

    escrow.status = 'completed';

    await this.saveToStorage();

    return transaction;
  }

  async disputeEscrow(escrowId, reason) {
    const escrow = this.escrow.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    escrow.status = 'disputed';
    escrow.dispute = {
      reason,
      timestamp: Date.now(),
      status: 'pending_review'
    };

    await this.saveToStorage();

    return escrow;
  }

  searchListings(filters = {}) {
    let results = Array.from(this.listings.values());

    // Filter by status
    if (filters.status) {
      results = results.filter(l => l.status === filters.status);
    }

    // Filter by category
    if (filters.category) {
      results = results.filter(l => l.category === filters.category);
    }

    // Filter by network
    if (filters.network) {
      results = results.filter(l => l.network === filters.network);
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      results = results.filter(l => l.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(l => l.price <= filters.maxPrice);
    }

    // Filter by pattern
    if (filters.pattern) {
      results = results.filter(l => l.pattern.includes(filters.pattern));
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(l =>
        filters.tags.some(tag => l.tags.includes(tag))
      );
    }

    // Sort
    if (filters.sortBy) {
      results = this.sortListings(results, filters.sortBy, filters.sortOrder);
    }

    return results;
  }

  sortListings(listings, sortBy, order = 'desc') {
    const sorted = [...listings].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'difficulty':
          comparison = a.difficulty - b.difficulty;
          break;
        case 'created':
          comparison = a.created - b.created;
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        default:
          comparison = 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  categorizePattern(pattern) {
    const difficulty = this.calculateDifficulty(pattern);

    for (const [category, config] of Object.entries(this.categories)) {
      if (difficulty >= config.minDifficulty) {
        return category;
      }
    }

    return 'common';
  }

  calculateDifficulty(pattern) {
    const charset = 16;
    const length = pattern.pattern.length;

    switch (pattern.type) {
      case 'prefix':
      case 'suffix':
        return Math.pow(charset, length);
      case 'contains':
        return Math.pow(charset, length) / length;
      default:
        return Math.pow(charset, length);
    }
  }

  calculateFee(amount) {
    // Platform fee: 2.5%
    return amount * 0.025;
  }

  async verifyOwnership(listing) {
    // Verify seller owns the private key
    try {
      // In production, use proper signature verification
      return listing.privateKey && listing.address;
    } catch {
      return false;
    }
  }

  encryptPrivateKey(privateKey) {
    // In production, use proper encryption
    return btoa(privateKey);
  }

  decryptPrivateKey(encrypted) {
    // In production, use proper decryption
    return atob(encrypted);
  }

  updateReputation(user, action) {
    const current = this.reputation.get(user) || {
      sales: 0,
      purchases: 0,
      disputes: 0,
      rating: 5.0
    };

    if (action === 'sale') {
      current.sales++;
    } else if (action === 'purchase') {
      current.purchases++;
    } else if (action === 'dispute') {
      current.disputes++;
      current.rating = Math.max(1.0, current.rating - 0.5);
    }

    this.reputation.set(user, current);
  }

  getReputation(user) {
    return this.reputation.get(user) || {
      sales: 0,
      purchases: 0,
      disputes: 0,
      rating: 5.0
    };
  }

  getTrendingPatterns(limit = 10) {
    const listings = Array.from(this.listings.values())
      .filter(l => l.status === 'active')
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return listings;
  }

  getRecentSales(limit = 10) {
    return this.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getMarketStats() {
    const activeListings = Array.from(this.listings.values())
      .filter(l => l.status === 'active');

    const totalVolume = this.transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgPrice = activeListings.length > 0
      ? activeListings.reduce((sum, l) => sum + l.price, 0) / activeListings.length
      : 0;

    return {
      totalListings: this.listings.size,
      activeListings: activeListings.length,
      totalSales: this.transactions.length,
      totalVolume,
      avgPrice,
      categories: this.getCategoryStats()
    };
  }

  getCategoryStats() {
    const stats = {};

    for (const category of Object.keys(this.categories)) {
      const listings = Array.from(this.listings.values())
        .filter(l => l.category === category);

      stats[category] = {
        count: listings.length,
        avgPrice: listings.length > 0
          ? listings.reduce((sum, l) => sum + l.price, 0) / listings.length
          : 0
      };
    }

    return stats;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  async saveToStorage() {
    const data = {
      listings: Array.from(this.listings.entries()),
      offers: Array.from(this.offers.entries()),
      transactions: this.transactions,
      reputation: Array.from(this.reputation.entries()),
      escrow: Array.from(this.escrow.entries())
    };

    localStorage.setItem('asuranity_marketplace', JSON.stringify(data));
  }

  loadFromStorage() {
    const stored = localStorage.getItem('asuranity_marketplace');
    if (!stored) return;

    try {
      const data = JSON.parse(stored);

      this.listings = new Map(data.listings || []);
      this.offers = new Map(data.offers || []);
      this.transactions = data.transactions || [];
      this.reputation = new Map(data.reputation || []);
      this.escrow = new Map(data.escrow || []);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    }
  }
}

export default PatternMarketplace;
