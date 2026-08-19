import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-bold text-white tracking-tight">
              ARTIUM
            </span>
            <p className="mt-3 text-sm leading-relaxed">
              Nền tảng dành cho nghệ sĩ bán và quản lý tác phẩm nghệ thuật.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Sản phẩm</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/artworks" className="text-sm hover:text-white transition-colors">
                  Tác phẩm
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm hover:text-white transition-colors">
                  Bảng giá
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Cộng đồng</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-white">Instagram</a></li>
              <li><a href="#" className="text-sm hover:text-white">Facebook</a></li>
              <li><a href="#" className="text-sm hover:text-white">Twitter / X</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Chính sách</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-white">Điều khoản</a></li>
              <li><a href="#" className="text-sm hover:text-white">Quyền riêng tư</a></li>
              <li><a href="#" className="text-sm hover:text-white">Hoàn tiền</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Artium. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
