const crypto = require('crypto');

class HelperFunctions {
  // Generate random string
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate UUID
  static generateUUID() {
    return crypto.randomUUID();
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sanitize string for database
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  }

  // Format date for display
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      default:
        return d.toISOString();
    }
  }

  // Calculate pagination offset
  static getPaginationOffset(page, limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    return {
      limit: limitNum,
      offset: Math.max(0, offset),
      page: pageNum
    };
  }

  // Validate required fields
  static validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    });
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // Deep clone object
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Extract domain from URL
  static extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return null;
    }
  }

  // Generate slug from string
  static generateSlug(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calculate reading time
  static calculateReadingTime(text, wordsPerMinute = 200) {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate color from string
  static stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const color = Math.floor(Math.abs(((Math.sin(hash) * 16777215) % 1) * 16777215)).toString(16);
    return '#' + '000000'.substring(0, 6 - color.length) + color;
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests, timeWindow) {
    const requests = new Map();
    
    return (identifier) => {
      const now = Date.now();
      const windowStart = now - timeWindow;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier);
      
      // Remove old requests outside the time window
      const recentRequests = userRequests.filter(time => time > windowStart);
      requests.set(identifier, recentRequests);
      
      if (recentRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      recentRequests.push(now);
      return true; // Request allowed
    };
  }
}

module.exports = HelperFunctions;
