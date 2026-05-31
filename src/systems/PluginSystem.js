/**
 * Plugin System
 * Extensible plugin architecture for ASURANITY
 */
export class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.middleware = [];
    this.loaded = new Set();
  }

  registerPlugin(plugin) {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }

    this.validatePlugin(plugin);
    this.plugins.set(plugin.name, plugin);

    return {
      name: plugin.name,
      version: plugin.version,
      registered: true
    };
  }

  validatePlugin(plugin) {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }

    if (!plugin.version) {
      throw new Error('Plugin must have a version');
    }

    if (typeof plugin.install !== 'function') {
      throw new Error('Plugin must have an install function');
    }
  }

  async loadPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (this.loaded.has(name)) {
      return { name, status: 'already_loaded' };
    }

    try {
      await plugin.install(this);
      this.loaded.add(name);

      return {
        name,
        status: 'loaded',
        hooks: plugin.hooks || [],
        middleware: plugin.middleware || []
      };
    } catch (error) {
      throw new Error(`Failed to load plugin ${name}: ${error.message}`);
    }
  }

  async unloadPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (!this.loaded.has(name)) {
      return { name, status: 'not_loaded' };
    }

    if (plugin.uninstall) {
      await plugin.uninstall(this);
    }

    this.loaded.delete(name);

    return { name, status: 'unloaded' };
  }

  registerHook(name, handler) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    this.hooks.get(name).push(handler);
  }

  async executeHook(name, data) {
    const handlers = this.hooks.get(name) || [];
    let result = data;

    for (const handler of handlers) {
      result = await handler(result);
    }

    return result;
  }

  registerMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  async executeMiddleware(context) {
    let result = context;

    for (const middleware of this.middleware) {
      result = await middleware(result);
    }

    return result;
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins() {
    return Array.from(this.plugins.values()).map(p => ({
      name: p.name,
      version: p.version,
      description: p.description,
      loaded: this.loaded.has(p.name)
    }));
  }

  listHooks() {
    return Array.from(this.hooks.keys());
  }
}

/**
 * API Layer
 * RESTful API interface for ASURANITY
 */
export class APILayer {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
    this.rateLimit = new Map();
  }

  route(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, handler);
  }

  get(path, handler) {
    this.route('GET', path, handler);
  }

  post(path, handler) {
    this.route('POST', path, handler);
  }

  put(path, handler) {
    this.route('PUT', path, handler);
  }

  delete(path, handler) {
    this.route('DELETE', path, handler);
  }

  use(middleware) {
    this.middleware.push(middleware);
  }

  async handle(method, path, data) {
    const key = `${method}:${path}`;
    const handler = this.routes.get(key);

    if (!handler) {
      return {
        status: 404,
        error: 'Route not found'
      };
    }

    let context = {
      method,
      path,
      data,
      response: null
    };

    for (const middleware of this.middleware) {
      context = await middleware(context);
      if (context.response) {
        return context.response;
      }
    }

    try {
      const result = await handler(context.data);
      return {
        status: 200,
        data: result
      };
    } catch (error) {
      return {
        status: 500,
        error: error.message
      };
    }
  }

  setupDefaultRoutes() {
    this.get('/api/health', async () => ({
      status: 'ok',
      timestamp: Date.now()
    }));

    this.get('/api/version', async () => ({
      version: '1.0.0',
      name: 'ASURANITY'
    }));

    this.post('/api/generate', async (data) => {
      return {
        address: '0x' + Math.random().toString(16).substring(2, 42),
        pattern: data.pattern
      };
    });

    this.get('/api/networks', async () => ({
      networks: ['ethereum', 'solana', 'bitcoin']
    }));

    this.get('/api/stats', async () => ({
      totalGenerated: 1000,
      totalUsers: 100
    }));
  }
}

/**
 * Real-time Collaboration System
 */
export class CollaborationSystem {
  constructor() {
    this.rooms = new Map();
    this.users = new Map();
    this.messages = [];
  }

  createRoom(name) {
    const room = {
      id: this.generateId(),
      name,
      users: new Set(),
      created: Date.now()
    };

    this.rooms.set(room.id, room);
    return room;
  }

  joinRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.users.add(userId);

    return {
      roomId,
      userId,
      users: Array.from(room.users)
    };
  }

  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.users.delete(userId);

    return {
      roomId,
      userId,
      users: Array.from(room.users)
    };
  }

  sendMessage(roomId, userId, message) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const msg = {
      id: this.generateId(),
      roomId,
      userId,
      message,
      timestamp: Date.now()
    };

    this.messages.push(msg);

    return msg;
  }

  getMessages(roomId, limit = 50) {
    return this.messages
      .filter(m => m.roomId === roomId)
      .slice(-limit);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

export { PluginSystem, APILayer, CollaborationSystem };
export default PluginSystem;
