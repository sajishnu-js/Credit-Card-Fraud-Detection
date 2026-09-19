export function HudCorners() {
  const base = "absolute size-4 border-cyan-300/40";
  return (
    <>
      <span className={`${base} top-3 left-3 border-t-2 border-l-2 rounded-tl-sm`} />
      <span className={`${base} top-3 right-3 border-t-2 border-r-2 rounded-tr-sm`} />
      <span className={`${base} bottom-3 left-3 border-b-2 border-l-2 rounded-bl-sm`} />
      <span className={`${base} bottom-3 right-3 border-b-2 border-r-2 rounded-br-sm`} />
    </>
  );
}
