/** Bôi vàng các đoạn khớp với từ khoá tìm kiếm trong nội dung tin nhắn */
export function highlightText(text: string, search: string) {
  if (!search.trim()) return <>{text}</>;
  const parts = text.split(
    new RegExp(`(${search.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"),
  );
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-300 text-slate-950 px-0.5 rounded font-semibold"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
