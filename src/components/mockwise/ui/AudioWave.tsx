export function AudioWave({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-1 h-7">
      {Array.from({ length: 32 }).map((_, i) => (
        <span
          key={i}
          style={{
            height: `${20 + ((i * 37) % 80)}%`,
            animationDelay: `${(i % 8) * 0.1}s`,
          }}
          className={[
            "w-1 rounded-full bg-gradient-to-t from-primary/40 to-primary origin-bottom",
            playing ? "animate-wave" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
