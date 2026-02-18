import { useEffect } from "react";
import { usePluginStore } from "../stores/pluginStore";
import { useVstChainStore } from "../stores/vstChainStore";
import { useAudioStore } from "../stores/audioStore";
import { getStemUrl } from "../api/client";

export default function VstPluginRack({ stemIndex, beatId, stems }) {
  const plugins = usePluginStore((s) => s.plugins);
  const loadPlugins = usePluginStore((s) => s.loadPlugins);

  const vstChain = useVstChainStore((s) => s.vstChains[stemIndex] || []);
  const processedStem = useVstChainStore((s) => s.processedStems[stemIndex]);
  const addPlugin = useVstChainStore((s) => s.addPlugin);
  const removePlugin = useVstChainStore((s) => s.removePlugin);
  const updateParam = useVstChainStore((s) => s.updateParam);
  const renderStem = useVstChainStore((s) => s.renderStem);
  const clearProcessedStem = useVstChainStore((s) => s.clearProcessedStem);

  const reloadStem = useAudioStore((s) => s.reloadStem);

  useEffect(() => {
    if (plugins.length === 0) loadPlugins();
  }, []);

  const stemName = stems?.[stemIndex];
  const isAnyRendering = vstChain.some((p) => p.isRendering);

  function handleAddPlugin(pluginPath) {
    const plugin = plugins.find((p) => p.path === pluginPath);
    if (!plugin) return;
    const defaultParams = {};
    for (const [key, p] of Object.entries(plugin.parameters || {})) {
      defaultParams[key] = p.default_value ?? 0;
    }
    addPlugin(stemIndex, pluginPath, plugin.name, defaultParams);
  }

  function handleRender() {
    if (!beatId || !stemName) return;
    renderStem(stemIndex, beatId, stemName);
  }

  function handleRevert() {
    if (!beatId || !stemName) return;
    clearProcessedStem(stemIndex);
    reloadStem(stemIndex, getStemUrl(beatId, stemName));
  }

  return (
    <div className="mt-2 space-y-2">
      {vstChain.length === 0 && plugins.length === 0 && (
        <p className="text-cream-muted/30 text-[10px] py-2">
          No VST3 plugins found. Go to the Plugins page to scan.
        </p>
      )}

      {vstChain.map((entry) => {
        const pluginDef = plugins.find((p) => p.path === entry.pluginPath);
        const params = pluginDef?.parameters || {};

        return (
          <div
            key={entry.id}
            className={`rounded-md border px-3 py-2 space-y-2 transition-all duration-200 ${
              entry.isRendering
                ? "border-gold/40 bg-gold/5"
                : "border-gold/20 bg-surface-raised/30"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-cream text-[11px] font-medium tracking-wide">
                {entry.pluginName}
              </span>
              <div className="flex items-center gap-1.5">
                {entry.isRendering && (
                  <span className="text-gold text-[8px] animate-pulse">RENDERING...</span>
                )}
                <button
                  onClick={() => removePlugin(stemIndex, entry.id)}
                  className="w-5 h-5 rounded flex items-center justify-center text-cream-muted/30 hover:text-danger hover:bg-danger/10 transition-all"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1l6 6M7 1l-6 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Parameters (top 8 for space) */}
            <div className="space-y-1.5">
              {Object.entries(entry.params)
                .slice(0, 8)
                .map(([paramKey, value]) => {
                  const paramDef = params[paramKey] || {};
                  return (
                    <div key={paramKey} className="flex items-center gap-2">
                      <span className="text-cream-muted/50 text-[9px] w-24 truncate">
                        {paramDef.name || paramKey}
                      </span>
                      <input
                        type="range"
                        min={paramDef.min_value ?? 0}
                        max={paramDef.max_value ?? 1}
                        step={0.01}
                        value={value}
                        onChange={(e) =>
                          updateParam(stemIndex, entry.id, paramKey, parseFloat(e.target.value))
                        }
                        className="flex-1 h-1"
                      />
                      <span className="text-cream-muted/40 text-[9px] w-10 text-right tabular-nums">
                        {typeof value === "number" ? value.toFixed(2) : value}
                      </span>
                    </div>
                  );
                })}
              {Object.keys(entry.params).length > 8 && (
                <p className="text-cream-muted/20 text-[8px]">
                  +{Object.keys(entry.params).length - 8} more parameters
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Add plugin + render controls */}
      <div className="flex gap-2 pt-1">
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddPlugin(e.target.value);
              e.target.value = "";
            }
          }}
          defaultValue=""
          className="flex-1 bg-surface-raised/40 border border-border-subtle rounded-md px-2 py-1.5 text-cream-muted text-[10px] tracking-wide cursor-pointer hover:border-gold/30 transition-colors"
        >
          <option value="" disabled>
            + Add VST3 Plugin...
          </option>
          {plugins.map((p) => (
            <option key={p.path} value={p.path}>
              {p.name} ({p.manufacturer || "Unknown"})
            </option>
          ))}
        </select>
      </div>

      {vstChain.length > 0 && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleRender}
            disabled={isAnyRendering || !beatId}
            className="flex-1 px-3 py-1.5 bg-gold/15 text-gold text-[10px] font-medium tracking-wider rounded-md border border-gold/20 hover:bg-gold/25 transition-all disabled:opacity-40"
          >
            {isAnyRendering ? "Rendering..." : "Render Through VST3 Chain"}
          </button>

          {processedStem && (
            <button
              onClick={handleRevert}
              className="px-3 py-1.5 bg-surface-raised/40 text-cream-muted text-[10px] tracking-wider rounded-md border border-border-subtle hover:border-border transition-all"
            >
              Revert
            </button>
          )}
        </div>
      )}

      {processedStem && (
        <div className="flex items-center gap-2 py-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-green-400/70 text-[9px] tracking-wide">
            Rendered through VST3 chain
          </span>
        </div>
      )}
    </div>
  );
}
