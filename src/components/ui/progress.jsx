export function Progress({
  value = 0,
  className = "",
}) {

  return (

    <div
      className={`
        h-3
        w-full
        rounded-full
        bg-zinc-800
        overflow-hidden
        ${className}
      `}
    >

      <div
        className="
          h-full
          rounded-full
          bg-violet-500
          transition-all
          duration-500
        "
        style={{
          width: `${value}%`,
        }}
      />

    </div>
  );
}