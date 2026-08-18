export default function AuthDivider() {
  return (
    <div className="my-7 flex items-center gap-4">
      <div className="h-px flex-1 bg-gray-200" />

      <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
        hoặc
      </span>

      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
