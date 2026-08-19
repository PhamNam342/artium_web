import { useState, type FormEvent } from 'react';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

type UserRole = 'ARTIST' | 'COLLECTOR';

export default function CompleteProfileModal() {
  const { user, completeProfile } = useAuth();

  const [role, setRole] = useState<UserRole | ''>('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user || user.role) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!role || !fullName.trim() || !location.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsLoading(true);

      await completeProfile(
        role,
        fullName.trim(),
        location.trim(),
      );

      toast.success('Hoàn thiện hồ sơ thành công');
    } catch {
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900">
          Hoàn thiện hồ sơ
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Hãy hoàn thiện thông tin trước khi tiếp tục.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Bạn là
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('ARTIST')}
                disabled={isLoading}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  role === 'ARTIST'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Artist
              </button>

              <button
                type="button"
                onClick={() => setRole('COLLECTOR')}
                disabled={isLoading}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  role === 'COLLECTOR'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Collector
              </button>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label
              htmlFor="full-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Họ và tên
            </label>

            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Địa điểm
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Hà Nội, Việt Nam"
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Hoàn tất'}
          </button>
        </form>
      </div>
    </div>
  );
}

