export function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accentgreen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
        <p className="text-accenttext">Загрузка...</p>
      </div>
    </div>
  );
}
