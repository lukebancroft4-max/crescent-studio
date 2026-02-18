import { useEffect, useCallback } from "react";
import {
  useEffectChainStore,
  EFFECT_DEFINITIONS,
  PARAM_RANGES,
} from "../stores/effectChainStore";
import { rebuildEffectChain, updateEffectParam } from "../stores/audioStore";

export default function EffectRack({ stemIndex }) {
  const chain = useEffectChainStore((s) => s.chains[stemIndex] || []);
  const addEffect = useEffectChainStore((s) => s.addEffect);
  const removeEffect = useEffectChainStore((s) => s.removeEffect);
  const updateParam = useEffectChainStore((s) => s.updateParam);
  const toggleBypass = useEffectChainStore((s) => s.toggleBypass);

  // Rebuild the Tone.js chain when structure changes
  const rebuild = useCallback(() => {
    rebuildEffectChain(stemIndex, chain);
  }, [stemIndex, chain]);

  useEffect(() => {
    rebuild();
  }, [rebuild]);

  function handleParamChange(effectId, effectIndex, paramKey, value) {
    updateParam(stemIndex, effectId, paramKey, value);
    // Real-time: update the Tone.js node directly
    const activeIndex = chain
      .filter((e) => !e.bypassed)
      .findIndex((e) => e.id === effectId);
    if (activeIndex >= 0) {
      updateEffectParam(stemIndex, activeIndex, paramKey, value);
    }
  }

  function handleAddEffect(type) {
    addEffect(stemIndex, type);
  }

  function handleRemove(effectId) {
    removeEffect(stemIndex, effectId);
  }

  function handleToggleBypass(effectId) {
    toggleBypass(stemIndex, effectId);
  }

  return (
    <div className="mt-2 space-y-2">
      {chain.map((effect, effectIndex) => {
        const def = EFFECT_DEFINITIONS[effect.type];
        const ranges = PARAM_RANGES[effect.type] || {};

        return (
          <div
            key={effect.id}
            className={`rounded-md border px-3 py-2 space-y-2 transition-all duration-200 ${
              effect.bypassed
                ? "border-border-subtle/30 opacity-50"
                : "border-gold/20 bg-surface-raised/30"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-cream text-[11px] font-medium tracking-wide">
                {def?.label || effect.type}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleBypass(effect.id)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider transition-all ${
                    effect.bypassed
                      ? "bg-cream-muted/10 text-cream-muted/40"
                      : "bg-gold/15 text-gold"
                  }`}
                >
                  {effect.bypassed ? "OFF" : "ON"}
                </button>
                <button
                  onClick={() => handleRemove(effect.id)}
                  className="w-5 h-5 rounded flex items-center justify-center text-cream-muted/30 hover:text-danger hover:bg-danger/10 transition-all"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1l6 6M7 1l-6 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Parameters */}
            {!effect.bypassed && (
              <div className="space-y-1.5">
                {Object.entries(effect.params).map(([paramKey, value]) => {
                  const range = ranges[paramKey] || { min: 0, max: 1, step: 0.01, unit: "" };
                  return (
                    <div key={paramKey} className="flex items-center gap-2">
                      <span className="text-cream-muted/50 text-[9px] w-20 capitalize truncate">
                        {paramKey}
                      </span>
                      <input
                        type="range"
                        min={range.min}
                        max={range.max}
                        step={range.step}
                        value={value}
                        onChange={(e) =>
                          handleParamChange(
                            effect.id,
                            effectIndex,
                            paramKey,
                            parseFloat(e.target.value)
                          )
                        }
                        className="flex-1 h-1"
                      />
                      <span className="text-cream-muted/40 text-[9px] w-14 text-right tabular-nums">
                        {typeof value === "number" ? value.toFixed(range.step < 1 ? 2 : 0) : value}
                        {range.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Effect dropdown */}
      <div className="pt-1">
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddEffect(e.target.value);
              e.target.value = "";
            }
          }}
          defaultValue=""
          className="w-full bg-surface-raised/40 border border-border-subtle rounded-md px-2 py-1.5 text-cream-muted text-[10px] tracking-wide cursor-pointer hover:border-gold/30 transition-colors"
        >
          <option value="" disabled>
            + Add Effect...
          </option>
          {Object.entries(EFFECT_DEFINITIONS).map(([type, def]) => (
            <option key={type} value={type}>
              {def.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
