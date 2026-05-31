/**
 * Multi-Language Support System
 * Internationalization and localization for ASURANITY
 */
export class I18nSystem {
  constructor() {
    this.locale = 'en';
    this.translations = new Map();
    this.fallbackLocale = 'en';
    this.loadedLocales = new Set();

    this.initializeDefaultTranslations();
  }

  initializeDefaultTranslations() {
    this.addTranslations('en', {
      'app.title': 'ASURANITY',
      'app.subtitle': 'Universal Vanity Address Generator',
      'nav.generate': 'Generate',
      'nav.networks': 'Networks',
      'nav.marketplace': 'Marketplace',
      'nav.settings': 'Settings',
      'generate.pattern': 'Pattern',
      'generate.pattern.placeholder': 'Enter pattern (e.g., abc123)',
      'generate.type': 'Pattern Type',
      'generate.type.prefix': 'Prefix',
      'generate.type.suffix': 'Suffix',
      'generate.type.contains': 'Contains',
      'generate.network': 'Network',
      'generate.start': 'Start Generation',
      'generate.stop': 'Stop',
      'generate.pause': 'Pause',
      'generate.resume': 'Resume',
      'results.title': 'Results',
      'results.empty': 'No results yet',
      'results.address': 'Address',
      'results.pattern': 'Pattern',
      'results.network': 'Network',
      'results.copy': 'Copy',
      'results.copied': 'Copied!',
      'stats.hashrate': 'Hash Rate',
      'stats.elapsed': 'Elapsed Time',
      'stats.difficulty': 'Difficulty',
      'stats.probability': 'Probability',
      'settings.workers': 'Worker Threads',
      'settings.batchsize': 'Batch Size',
      'settings.autosave': 'Auto Save',
      'settings.notifications': 'Notifications',
      'settings.theme': 'Theme',
      'settings.language': 'Language',
      'error.pattern.empty': 'Pattern cannot be empty',
      'error.pattern.invalid': 'Invalid pattern',
      'error.network.unsupported': 'Network not supported',
      'error.generation.failed': 'Generation failed',
      'success.generated': 'Address generated successfully',
      'success.saved': 'Saved successfully',
      'success.exported': 'Exported successfully'
    });

    this.addTranslations('es', {
      'app.title': 'ASURANITY',
      'app.subtitle': 'Generador Universal de Direcciones Vanity',
      'nav.generate': 'Generar',
      'nav.networks': 'Redes',
      'nav.marketplace': 'Mercado',
      'nav.settings': 'Configuración',
      'generate.pattern': 'Patrón',
      'generate.pattern.placeholder': 'Ingrese patrón (ej., abc123)',
      'generate.type': 'Tipo de Patrón',
      'generate.type.prefix': 'Prefijo',
      'generate.type.suffix': 'Sufijo',
      'generate.type.contains': 'Contiene',
      'generate.network': 'Red',
      'generate.start': 'Iniciar Generación',
      'generate.stop': 'Detener',
      'generate.pause': 'Pausar',
      'generate.resume': 'Reanudar',
      'results.title': 'Resultados',
      'results.empty': 'Sin resultados aún',
      'results.address': 'Dirección',
      'results.pattern': 'Patrón',
      'results.network': 'Red',
      'results.copy': 'Copiar',
      'results.copied': '¡Copiado!',
      'stats.hashrate': 'Tasa de Hash',
      'stats.elapsed': 'Tiempo Transcurrido',
      'stats.difficulty': 'Dificultad',
      'stats.probability': 'Probabilidad',
      'settings.workers': 'Hilos de Trabajo',
      'settings.batchsize': 'Tamaño de Lote',
      'settings.autosave': 'Guardar Automáticamente',
      'settings.notifications': 'Notificaciones',
      'settings.theme': 'Tema',
      'settings.language': 'Idioma',
      'error.pattern.empty': 'El patrón no puede estar vacío',
      'error.pattern.invalid': 'Patrón inválido',
      'error.network.unsupported': 'Red no soportada',
      'error.generation.failed': 'Generación fallida',
      'success.generated': 'Dirección generada exitosamente',
      'success.saved': 'Guardado exitosamente',
      'success.exported': 'Exportado exitosamente'
    });

    this.addTranslations('zh', {
      'app.title': 'ASURANITY',
      'app.subtitle': '通用靓号地址生成器',
      'nav.generate': '生成',
      'nav.networks': '网络',
      'nav.marketplace': '市场',
      'nav.settings': '设置',
      'generate.pattern': '模式',
      'generate.pattern.placeholder': '输入模式（例如：abc123）',
      'generate.type': '模式类型',
      'generate.type.prefix': '前缀',
      'generate.type.suffix': '后缀',
      'generate.type.contains': '包含',
      'generate.network': '网络',
      'generate.start': '开始生成',
      'generate.stop': '停止',
      'generate.pause': '暂停',
      'generate.resume': '继续',
      'results.title': '结果',
      'results.empty': '暂无结果',
      'results.address': '地址',
      'results.pattern': '模式',
      'results.network': '网络',
      'results.copy': '复制',
      'results.copied': '已复制！',
      'stats.hashrate': '哈希率',
      'stats.elapsed': '已用时间',
      'stats.difficulty': '难度',
      'stats.probability': '概率',
      'settings.workers': '工作线程',
      'settings.batchsize': '批量大小',
      'settings.autosave': '自动保存',
      'settings.notifications': '通知',
      'settings.theme': '主题',
      'settings.language': '语言',
      'error.pattern.empty': '模式不能为空',
      'error.pattern.invalid': '无效模式',
      'error.network.unsupported': '不支持的网络',
      'error.generation.failed': '生成失败',
      'success.generated': '地址生成成功',
      'success.saved': '保存成功',
      'success.exported': '导出成功'
    });

    this.addTranslations('ja', {
      'app.title': 'ASURANITY',
      'app.subtitle': 'ユニバーサルバニティアドレスジェネレーター',
      'nav.generate': '生成',
      'nav.networks': 'ネットワーク',
      'nav.marketplace': 'マーケット',
      'nav.settings': '設定',
      'generate.pattern': 'パターン',
      'generate.pattern.placeholder': 'パターンを入力（例：abc123）',
      'generate.type': 'パターンタイプ',
      'generate.type.prefix': 'プレフィックス',
      'generate.type.suffix': 'サフィックス',
      'generate.type.contains': '含む',
      'generate.network': 'ネットワーク',
      'generate.start': '生成開始',
      'generate.stop': '停止',
      'generate.pause': '一時停止',
      'generate.resume': '再開',
      'results.title': '結果',
      'results.empty': 'まだ結果がありません',
      'results.address': 'アドレス',
      'results.pattern': 'パターン',
      'results.network': 'ネットワーク',
      'results.copy': 'コピー',
      'results.copied': 'コピーしました！',
      'stats.hashrate': 'ハッシュレート',
      'stats.elapsed': '経過時間',
      'stats.difficulty': '難易度',
      'stats.probability': '確率',
      'settings.workers': 'ワーカースレッド',
      'settings.batchsize': 'バッチサイズ',
      'settings.autosave': '自動保存',
      'settings.notifications': '通知',
      'settings.theme': 'テーマ',
      'settings.language': '言語',
      'error.pattern.empty': 'パターンを入力してください',
      'error.pattern.invalid': '無効なパターン',
      'error.network.unsupported': 'サポートされていないネットワーク',
      'error.generation.failed': '生成に失敗しました',
      'success.generated': 'アドレスが正常に生成されました',
      'success.saved': '正常に保存されました',
      'success.exported': '正常にエクスポートされました'
    });
  }

  addTranslations(locale, translations) {
    if (!this.translations.has(locale)) {
      this.translations.set(locale, new Map());
    }

    const localeMap = this.translations.get(locale);
    for (const [key, value] of Object.entries(translations)) {
      localeMap.set(key, value);
    }

    this.loadedLocales.add(locale);
  }

  setLocale(locale) {
    if (!this.loadedLocales.has(locale)) {
      console.warn(`Locale ${locale} not loaded, using fallback`);
      locale = this.fallbackLocale;
    }

    this.locale = locale;
    this.saveLocale();
  }

  getLocale() {
    return this.locale;
  }

  t(key, params = {}) {
    const localeMap = this.translations.get(this.locale);
    let translation = localeMap?.get(key);

    if (!translation) {
      const fallbackMap = this.translations.get(this.fallbackLocale);
      translation = fallbackMap?.get(key) || key;
    }

    return this.interpolate(translation, params);
  }

  interpolate(text, params) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  formatNumber(num, options = {}) {
    return new Intl.NumberFormat(this.locale, options).format(num);
  }

  formatDate(date, options = {}) {
    return new Intl.DateTimeFormat(this.locale, options).format(date);
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency
    }).format(amount);
  }

  formatRelativeTime(value, unit) {
    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
    return rtf.format(value, unit);
  }

  getAvailableLocales() {
    return Array.from(this.loadedLocales);
  }

  saveLocale() {
    localStorage.setItem('asuranity_locale', this.locale);
  }

  loadLocale() {
    const saved = localStorage.getItem('asuranity_locale');
    if (saved && this.loadedLocales.has(saved)) {
      this.locale = saved;
    }
  }

  detectBrowserLocale() {
    const browserLocale = navigator.language.split('-')[0];
    if (this.loadedLocales.has(browserLocale)) {
      return browserLocale;
    }
    return this.fallbackLocale;
  }
}

/**
 * Documentation System
 */
export class DocumentationSystem {
  constructor() {
    this.docs = new Map();
    this.categories = new Map();
    this.searchIndex = new Map();
  }

  addDocument(doc) {
    this.docs.set(doc.id, doc);

    if (doc.category) {
      if (!this.categories.has(doc.category)) {
        this.categories.set(doc.category, []);
      }
      this.categories.get(doc.category).push(doc.id);
    }

    this.indexDocument(doc);
  }

  indexDocument(doc) {
    const words = this.tokenize(doc.title + ' ' + doc.content);

    for (const word of words) {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word).add(doc.id);
    }
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  search(query) {
    const words = this.tokenize(query);
    const results = new Map();

    for (const word of words) {
      const docIds = this.searchIndex.get(word);
      if (docIds) {
        for (const id of docIds) {
          results.set(id, (results.get(id) || 0) + 1);
        }
      }
    }

    return Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.docs.get(id));
  }

  getDocument(id) {
    return this.docs.get(id);
  }

  getCategory(category) {
    const docIds = this.categories.get(category) || [];
    return docIds.map(id => this.docs.get(id));
  }

  getAllCategories() {
    return Array.from(this.categories.keys());
  }
}

export { I18nSystem, DocumentationSystem };
export default I18nSystem;
