const m = new Map();
module.exports = { default: { getItem: async k => m.has(k) ? m.get(k) : null, setItem: async (k,v) => { m.set(k,v); } } };
module.exports.__esModule = true;
