import { useState, useEffect } from "react";
import { usePluginStore } from "../stores/pluginStore";

export default function PluginsPage() {
  const plugins = usePluginStore((s) => s.plugins);
  const isScanning = usePluginStore((s) => s.isScanning);
  const error = usePluginStore((s) => s.error);
  const scanPlugins = usePluginStore((s) => s.scanPlugins);
  const loadPlugins = usePluginStore((s) => s.loadPlugins);

  const [search, setSearch] = useState("");
  const [selectedPlugin, setSelectedPlugin] = useState(null);

  useEffect(() => {
    loadPlugins();
  }, []);

  const filtered = plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.manufacturer || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-cream text-lg font-display tracking-[0.08em]">
            VST3 Plugins
          </h2>
          <p className="text-cream-muted/50 text-xs mt-1">
            Scan and browse installed VST3 plugins
          </p>
        </div>
        <button
          onClick={() => scanPlugins()}
          disabled={isScanning}
          className="px-4 py-2 bg-gold/15 text-gold text-xs font-medium tracking-wider rounded-lg border border-gold/20 hover:bg-gold/25 transition-all disabled:opacity-50"
        >
          {isScanning ? "Scanning..." : "Scan for Plugins"}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-danger text-xs">
          {error}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search plugins by name or manufacturer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-surface-raised/40 border border-border-subtle rounded-lg px-4 py-2.5 text-cream text-sm placeholder:text-cream-muted/30 focus:outline-none focus:border-gold/30"
      />

      {/* Plugin list + detail panel */}
      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 space-y-2">
          {filtered.length === 0 && !isScanning && (
            <div className="text-center py-12 text-cream-muted/40 text-sm">
              {plugins.length === 0
                ? "No plugins found. Click \"Scan for Plugins\" to discover installed VST3s."
                : "No plugins match your search."}
            </div>
          )}

          {filtered.map((plugin) => (
            <button
              key={plugin.path}
              onClick={() => setSelectedPlugin(plugin)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selectedPlugin?.path === plugin.path
                  ? "border-gold/30 bg-gold/5"
                  : "border-border-subtle hover:border-border bg-surface-raised/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cream text-sm font-medium">{plugin.name}</p>
                  <p className="text-cream-muted/40 text-[10px] mt-0.5">
                    {plugin.manufacturer || "Unknown"}{" "}
                    {plugin.category && `· ${plugin.category}`}
                  </p>
                </div>
                <span className="text-cream-muted/30 text-[10px]">
                  {plugin.param_count} params
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selectedPlugin && (
          <div className="w-80 shrink-0 panel rounded-lg p-5 space-y-4 self-start sticky top-8">
            <div>
              <h3 className="text-cream text-sm font-medium">{selectedPlugin.name}</h3>
              <p className="text-cream-muted/40 text-[10px] mt-1">
                {selectedPlugin.manufacturer || "Unknown"}
              </p>
              {selectedPlugin.category && (
                <p className="text-cream-muted/30 text-[10px]">
                  {selectedPlugin.category}
                </p>
              )}
            </div>

            <div className="border-t border-border-subtle pt-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-cream-muted/50 mb-2">
                Parameters ({selectedPlugin.param_count})
              </p>
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {Object.entries(selectedPlugin.parameters || {}).map(
                  ([key, param]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-[10px] py-1"
                    >
                      <span className="text-cream-muted/60 truncate mr-2">
                        {param.name || key}
                      </span>
                      <span className="text-cream-muted/30 tabular-nums shrink-0">
                        {param.default_value?.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="border-t border-border-subtle pt-3">
              <p className="text-cream-muted/30 text-[9px] break-all">
                {selectedPlugin.path}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
