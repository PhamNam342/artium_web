import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Artium khác biệt như thế nào so với các nền tảng khác?',
      answer:
        'Artium cung cấp bộ công cụ tất-cả-trong-một thiết kế riêng cho nghệ sĩ: từ quản lý bộ sưu tập, chứng nhận tác phẩm (Certificate of Authenticity), CRM quản lý người sưu tầm đến thanh toán và vận chuyển phẳng.',
    },
    {
      question: 'Làm thế nào để tôi bán tác phẩm trên Artium?',
      answer:
        'Bạn chỉ cần tạo tài khoản, đăng tải bộ sưu tập tác phẩm, thiết lập mức giá và phương thức thanh toán. Bạn có thể chia sẻ liên kết cửa hàng hoặc nhúng vào trang cá nhân của bạn.',
    },
    {
      question: 'Artium chỉ dành cho bán hàng online hay cả giao dịch trực tiếp?',
      answer:
        'Artium hỗ trợ cả bán hàng online lẫn giao dịch trực tiếp nhờ tính năng Tap-to-Pay và mã QR thanh toán nhanh trên thiết bị di động.',
    },
    {
      question: 'Tôi có thể dùng Artium để kết nối với người mua không?',
      answer:
        'Có! Hệ thống CRM tích hợp cho phép bạn lưu thông tin người sưu tầm, theo dõi lịch sử mua hàng và gửi bản tin (newsletter) trực tiếp đến họ.',
    },
    {
      question: 'Tôi có thể nhập danh sách liên hệ hiện có vào Artium không?',
      answer:
        'Hoàn toàn được. Bạn có thể nhập file CSV danh sách người sưu tầm và khách hàng tiềm năng vào hệ thống CRM của Artium chỉ trong vài cú click.',
    },
    {
      question: 'Chi phí sử dụng Artium là bao nhiêu?',
      answer:
        'Bạn có thể bắt đầu hoàn toàn miễn phí với các tính năng cơ bản. Khi kinh doanh phát triển, bạn có thể nâng cấp lên các gói trả phí với mức phí cố định minh bạch.',
    },
  ];

  return (
    <div className="w-full bg-white text-gray-900 font-sans antialiased overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] bg-gradient-to-b from-gray-200 via-gray-100 to-white flex flex-col justify-between pt-12 pb-16 px-6 sm:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/80 via-gray-200/50 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-left w-full pt-16 sm:pt-24 z-10">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-gray-900 leading-[1.05] max-w-4xl">
            You make the art, <br />
            we do the rest
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl font-normal leading-relaxed">
            Streamline your business, discover new opportunities, and connect with a thriving community—all in one platform.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="relative z-10 text-right max-w-5xl mx-auto w-full pt-12">
          <p className="text-xs text-gray-400 font-mono tracking-wider uppercase">
            Artwork by <span className="text-gray-600 font-medium">Jacob Rodriguez</span>
          </p>
        </div>
      </section>

      {/* FEATURE 1 */}
      <section className="py-24 px-6 sm:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Your Art, <br />
              Your Story
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md">
              Curate your portfolio, organize artworks, and share your journey effortlessly. Enable subscriptions so collectors never miss an update.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center text-blue-600 font-semibold text-sm hover:underline group"
            >
              Explore features
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    Digital Portfolio 2026.pdf
                  </p>
                  <p className="text-[11px] text-gray-400">Updated 2 hours ago</p>
                </div>
                <span className="text-xs text-gray-400">✕</span>
              </div>

              <div className="w-48 h-80 bg-gray-900 rounded-[36px] p-2 mx-auto shadow-2xl border-4 border-gray-800">
                <div className="w-full h-full bg-gray-100 rounded-[28px] overflow-hidden flex flex-col justify-end p-4">
                  <div className="bg-white rounded-xl p-3 shadow-md">
                    <div className="w-full h-24 bg-gradient-to-tr from-amber-200 to-rose-300 rounded-lg mb-2" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                    <div className="h-2 w-1/2 bg-gray-100 rounded mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 2 */}
      <section className="py-24 px-6 sm:px-12 max-w-6xl mx-auto border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-gray-50 border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full flex items-center justify-center">
                  Active
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-4/5 bg-gray-100 rounded" />
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Stay Connected, <br />
              Build Relationships
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md">
              With our smart CRM, effortlessly manage your collectors, track interactions, and follow up with potential buyers—all in one place.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center text-blue-600 font-semibold text-sm hover:underline group"
            >
              Get Started
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE 3 */}
      <section className="py-24 px-6 sm:px-12 max-w-6xl mx-auto border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Collect Payments <br />
              with Ease
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Flat-rate Shipments
            </p>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md">
              Get paid instantly with Tap to Pay, sell through QR codes, and offer contactless checkout.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center text-blue-600 font-semibold text-sm hover:underline group"
            >
              Get Started
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-3xl p-8 shadow-sm relative">
              <div className="w-52 h-96 bg-gray-900 rounded-[40px] p-3 mx-auto shadow-2xl border-4 border-gray-800">
                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col justify-between p-6 text-center">
                  <div className="pt-8">
                    <p className="text-xs text-gray-400 font-medium">Payment Received</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">$10,000</p>
                  </div>
                  <div className="pb-4">
                    <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                      ✓ Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DARK BANNER */}
      <section className="bg-gray-950 text-white py-24 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Get Started in Just a Few Steps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-3">
              <span className="text-3xl font-black text-gray-500">1</span>
              <h3 className="text-lg font-bold">Build Your Portfolio</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upload your works and become a verified artist on Artium.
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-3xl font-black text-gray-500">2</span>
              <h3 className="text-lg font-bold">Grow Your Community</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Collect subscribers and send newsletters.
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-3xl font-black text-gray-500">3</span>
              <h3 className="text-lg font-bold">Process Your Sales</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Unlock tap-to-pay and invoices with flat-rate shipping.
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-3xl font-black text-gray-500">4</span>
              <h3 className="text-lg font-bold">Level up Your Business</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Get insights and auto-connect with more buyers online.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-6">
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white text-gray-950 font-semibold text-sm rounded-full hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12">
          FAQ
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center text-left py-2 focus:outline-none group cursor-pointer"
              >
                <span className="text-base sm:text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {faq.question}
                </span>
                <span className="text-xl text-gray-400 ml-4 font-light">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>

              {openFaq === idx && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed pr-8">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 sm:px-12 text-center bg-gray-50/50">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Start for Free, <br />
            Scale as You Grow
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Artium provides all the essential tools to sell your art, manage your art business and grow your community.
          </p>
          <div>
            <Link
              to="/register"
              className="inline-block px-8 py-3.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
