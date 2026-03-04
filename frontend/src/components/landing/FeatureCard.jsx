/**
 * FeatureCard — individual feature highlight used in the landing section
 */
export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="panel rounded-lg p-5 flex flex-col gap-3 hover:border-gold/30 transition-all duration-200">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-display text-lg text-cream tracking-wide font-light mb-1">
          {title}
        </h3>
        <p className="text-cream-muted text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
