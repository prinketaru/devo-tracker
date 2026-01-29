export function Features() {
  const features = [
    { icon: "✓", title: "Track Daily", description: "Log devotions in seconds" },
    { icon: "📊", title: "See Progress", description: "Watch your consistency grow" },
    { icon: "💬", title: "Reflect", description: "Capture your thoughts" },
  ];

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 xl:max-w-5xl xl:px-8 2xl:max-w-6xl 2xl:px-10">
      <h2 className="mb-10 text-center text-2xl font-bold text-stone-900 xl:text-3xl 2xl:text-4xl dark:text-stone-50">
        Simple features, real impact
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-stone-50/80 dark:bg-zinc-900/60 rounded-lg p-6 border border-stone-200 dark:border-zinc-800 shadow-sm">
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-50 mb-1">
              {feature.title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
