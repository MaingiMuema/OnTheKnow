import { TrendResponse, generateTrend } from './ai';

interface CachedTrend extends TrendResponse {
  timestamp: number;
}

class TrendCacheService {
  private cache: CachedTrend[] = [];
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  private readonly MIN_TRENDS = 6;
  private isGenerating = false;

  private cleanExpiredTrends() {
    const now = Date.now();
    this.cache = this.cache.filter(
      trend => now - trend.timestamp < this.CACHE_DURATION
    );
  }

  async ensureMinimumTrends() {
    if (this.isGenerating) return;
    
    this.cleanExpiredTrends();
    
    if (this.cache.length >= this.MIN_TRENDS) return;

    try {
      this.isGenerating = true;
      const trendsToGenerate = this.MIN_TRENDS - this.cache.length;
      
      const newTrendsPromises = Array(trendsToGenerate)
        .fill(null)
        .map(async () => {
          const trend = await generateTrend();
          return {
            ...trend,
            timestamp: Date.now()
          };
        });

      const newTrends = await Promise.all(newTrendsPromises);
      this.cache.push(...newTrends);
    } catch (error) {
      console.error('Error generating trends:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  getLatestTrends(count: number = this.MIN_TRENDS): TrendResponse[] {
    this.cleanExpiredTrends();
    return this.cache
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
      .map(({ timestamp, ...trend }) => trend);
  }

  async refreshTrends() {
    await this.ensureMinimumTrends();
    return this.getLatestTrends();
  }
}

// Export a singleton instance
export const trendCache = new TrendCacheService();
