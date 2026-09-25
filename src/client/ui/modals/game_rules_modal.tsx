// [IMP-72] GameRulesModal — Hướng Dẫn & Thể Lệ Game Toàn Diện (Clean & Modern Style)
import React, { useState, useRef, useEffect } from 'react';

type GameRulesTab = 'core' | 'cards' | 'mechanics';

export interface GameRulesModalProps {
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly initialTab?: GameRulesTab;
}

export function GameRulesModal({
  isOpen,
  onClose,
  initialTab = 'core',
}: GameRulesModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<GameRulesTab>(initialTab);
  const contentRef = useRef<HTMLElement>(null);

  // Cuộn về đầu trang mỗi khi chuyển tab để chống giữ vị trí cuộn cũ
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 pointer-events-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-xl h-[85dvh] max-h-[640px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 animate-in zoom-in-95 duration-200"
        data-testid="game-rules-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <h2 id="rules-modal-title" className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>📖</span> HƯỚNG DẪN & THỂ LỆ GAME
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            data-testid="close-rules-modal-btn"
            aria-label="Đóng hướng dẫn"
          >
            ✕
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex items-center p-2 gap-1.5 bg-slate-100/70 border-b border-slate-200 shrink-0" aria-label="Danh mục hướng dẫn">
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`flex-1 min-h-[44px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'core'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            data-testid="rules-tab-core"
          >
            <span>🏆</span>
            <span>Quy Tắc<span className="hidden sm:inline"> Cốt Lõi</span></span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex-1 min-h-[44px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'cards'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            data-testid="rules-tab-cards"
          >
            <span>🃏</span>
            <span><span className="sm:hidden">Thẻ &amp; Ô Cờ</span><span className="hidden sm:inline">Danh Mục Thẻ &amp; Ô Cờ</span></span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex-1 min-h-[44px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'mechanics'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            data-testid="rules-tab-mechanics"
          >
            <span>⚖️</span>
            <span>Cơ Chế<span className="hidden sm:inline"> Đặc Biệt</span></span>
          </button>
        </nav>

        {/* Tab Content */}
        <main ref={contentRef} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-slate-700">
          {activeTab === 'core' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">💰</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Vốn Khởi Điểm Linh Hoạt &amp; Lương Vượt GO</h3>
                  <p>
                    Vốn khởi đầu phân tầng theo số người chơi: <strong className="text-blue-700 font-semibold">2 người: 25.000 Tr.</strong>, <strong className="text-blue-700 font-semibold">3 người: 20.000 Tr.</strong>, <strong className="text-blue-700 font-semibold">4 người: 18.000 Tr.</strong> VNĐ (mức chuẩn từ 15.000 Tr. trở lên). Khi hoàn thành một vòng quanh bàn cờ hoặc dừng tại ô Khởi Hành (GO), nhận thêm mức lương <strong className="text-emerald-700 font-semibold">+2.000 Tr.</strong> VNĐ.
                  </p>
                  <p className="mt-1 text-slate-600 text-[11px]">
                    <strong className="text-slate-800 font-semibold">Thuế Đất Đai Vượt GO:</strong> Sở hữu 4–6 ô đất bị truy thu 150 Tr./ô; sở hữu từ 7 ô trở lên bị thu 400 Tr./ô kèm phụ thu 300 Tr./công trình C2-C3.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">🎲</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Xúc Xắc &amp; Đổ Đôi</h3>
                  <p>
                    Người chơi tung 2 viên xúc xắc để di chuyển. Nếu tung được <strong className="text-slate-900 font-semibold">xúc xắc đôi</strong> (hai mặt giống nhau), bạn được quyền thực hiện thêm 1 lượt tung tiếp theo. Tuy nhiên, nếu đổ 3 lần xúc xắc đôi liên tiếp, bạn sẽ bị phạt tống giam ngay vào ô Tạm Giam Kiểm Toán.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">⏳</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Thời Lượng Ván Đấu &amp; Lạm Phát Về Đích</h3>
                  <p>
                    Cuộc đua tài phiệt kéo dài tối đa <strong className="text-slate-900 font-semibold">40 vòng</strong> quanh bàn cờ. Để đẩy nhanh tốc độ phân định tài chính: từ <strong className="text-blue-700 font-semibold">vòng 20–29</strong>, tiền thuê BĐS tự động tăng <strong className="text-blue-700 font-semibold">20%</strong>; từ <strong className="text-rose-700 font-semibold">vòng 30 trở đi</strong>, tiền thuê BĐS tăng vọt <strong className="text-rose-700 font-semibold">50%</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">🏆</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Hai Điều Kiện Thắng</h3>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700">
                    <li>
                      <strong className="text-slate-900 font-semibold">Thắng Tuyệt Đối:</strong> Là người chơi duy nhất còn trụ lại mà không bị phá sản sau khi tất cả đối thủ vỡ nợ.
                    </li>
                    <li>
                      <strong className="text-slate-900 font-semibold">Thắng Điểm Tài Sản:</strong> Sau khi hoàn thành <strong className="text-slate-900 font-semibold">40 vòng</strong>, người chơi có tổng tài sản ròng (tiền mặt + giá trị BĐS + cổ phiếu) cao nhất sẽ giành chiến thắng chung cuộc theo <strong className="text-slate-900 font-semibold">điều kiện thắng</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>🏘️</span> 28 Bất Động Sản Tỉnh Thành &amp; Cấp Công Trình
                </h3>
                <p className="mb-2">
                  Bàn cờ có <strong className="text-slate-900 font-semibold">28</strong> ô bất động sản chia làm 8 <strong className="text-blue-700 font-semibold">nhóm màu</strong> địa lý. Khi sở hữu trọn bộ nhóm màu độc quyền, tiền thuê đất trống tăng gấp đôi.
                </p>
                <div className="flex flex-col gap-1.5 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">Cấp công trình:</span>
                    <span>Đất Trống (C0) ➔ Nhà Cấp 1 (C1) ➔ Nhà Cấp 2 (C2) ➔ Biệt Thự Cấp 3 (C3, cấp cao nhất thay thế <strong className="text-amber-700 font-semibold">khách sạn</strong>)</span>
                  </div>
                  <div className="text-[10.5px] text-slate-500 pt-1 border-t border-slate-100 flex flex-col gap-0.5">
                    <span>• <strong className="text-slate-700 font-semibold">Nhà Cấp 2 (C2):</strong> Thu thêm phụ phí dịch vụ +200 Tr. khi đối thủ dừng chân.</span>
                    <span>• <strong className="text-slate-700 font-semibold">Biệt Thự C3:</strong> Kích hoạt hiệu ứng đặc quyền <strong className="text-rose-600 font-semibold">Hoãn Lượt (Skip Turn)</strong> đối thủ!</span>
                    <span>• <strong className="text-slate-700 font-semibold">Quy Tắc Xây Đều Tay:</strong> Phải nâng cấp các ô cùng nhóm màu đồng đều trước khi lên cấp tiếp theo.</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>✈️</span> 4 Trạm Hạ Tầng Giao Thông
                </h3>
                <p>
                  Gồm 4 trạm huyết mạch: <strong className="text-slate-900 font-semibold">sân bay</strong> Cát Bi, <strong className="text-slate-900 font-semibold">sân bay</strong> Đà Nẵng, Cảng Sài Gòn và <strong className="text-slate-900 font-semibold">sân bay</strong> Phú Quốc.
                </p>
                <p className="mt-1 text-slate-600">
                  Tiền thuê tăng theo cấp số trạm sở hữu: 1 trạm = 500 Tr. ➔ 2 trạm = 1.000 Tr. ➔ 3 trạm = 2.000 Tr. ➔ 4 trạm = 4.000 Tr. VNĐ. Nâng cấp Thu Phí Tự Động Không Dừng ETC (1.500 Tr.) để nhận thêm +50% tiền vé.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>⚡</span> 2 Công Ty Tiện Ích Công Cộng
                </h3>
                <p>
                  Gồm Điện Lực và Nước Sạch. Tiền thuê tính theo công thức xúc xắc:
                </p>
                <p className="mt-1 text-slate-600">
                  Sở hữu 1 <strong className="text-slate-900 font-semibold">tiện ích</strong>: Điểm xúc xắc × 40 Tr. VNĐ. Sở hữu cả 2 tiện ích: Điểm xúc xắc × 100 Tr. VNĐ. Nâng cấp Công Nghệ Xanh (1.000 Tr.) để nhận Điểm xúc xắc × 150 Tr. VNĐ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                  <h4 className="font-bold text-sky-900 text-xs flex items-center gap-1.5 mb-1">
                    <span>⚡</span> 20 Phiếu Cơ Hội
                  </h4>
                  <p className="text-[11px] text-sky-800 leading-normal">
                    Quyền Lên Thổ Cư nâng cấp thẳng C1 không cần đủ bộ màu, hoán đổi dự án chiến lược, chốt lời cổ phiếu hoặc chế tài dự án chậm tiến độ (thu hồi nếu mất thanh khoản).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                  <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 mb-1">
                    <span>📰</span> 16 Phiếu Thị Trường
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    Biến động vĩ mô thực tế: Chốt nồng độ cồn Nghị Định 100 (phạt 800 Tr. &amp; giữ xe), Bão duyên hải cô lập, Siết tín dụng đóng băng BĐS 2 vòng, hay Kích cầu kinh tế đêm.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>📈</span> Sàn Giao Dịch Chứng Khoán HOSE &amp; Lệ Phí
                </h3>
                <p>
                  Ô Sàn Giao Dịch <strong className="text-blue-700 font-semibold">HOSE</strong> cho phép đầu tư chỉ số VN-Index sinh lời theo biến động thị trường. Ô Lệ Phí Đất Đai yêu cầu nộp 2.000 Tr. hoặc 10% tổng giá trị tài sản vào Ngân sách.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'mechanics' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2 mb-1">
                  <span>🚨</span> Trạm Kiểm Toán &amp; Tạm Giam
                </h3>
                <p className="text-rose-800 mb-1.5">
                  Khi dừng tại ô Lệnh Thu Thuế (ô 30) hoặc đổ 3 lần xúc xắc đôi liên tiếp, bạn bị tống vào ô <strong className="font-semibold">Tạm Giam</strong> của Trạm <strong className="font-semibold">Kiểm Toán</strong> (ô 10).
                </p>
                <p className="text-rose-900 font-semibold text-[11px] mb-1">3 Phương Thức Thoát Án:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-rose-800">
                  <li>Nộp tiền bảo lãnh 500 Tr. VNĐ ở đầu lượt để đi tiếp ngay.</li>
                  <li>Đổ thành công xúc xắc đôi trong tối đa 3 lượt tiếp theo.</li>
                  <li>Sử dụng Thẻ Miễn Kiểm Toán nếu đang nắm giữ.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2 mb-1">
                  <span>🤝</span> Thâu Tóm Bắt Buộc (Compulsory Buyout 130%)
                </h3>
                <p className="text-indigo-900 text-[11px] leading-relaxed">
                  Khi dừng chân tại ô đất cấp 0 của đối thủ (chưa thế chấp, không thuộc nhóm màu độc quyền), bạn có quyền kích hoạt <strong className="font-semibold text-indigo-950">Thâu Tóm Bắt Buộc</strong> bằng cách trả khoản bồi thường bằng <strong className="font-semibold text-indigo-950">130% giá niêm yết</strong> để lập tức sở hữu ô đất, phá vỡ chiến thuật phòng thủ của đối phương!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>🔨</span> Đấu Giá Công Khai &amp; Phát Mãi Kho Bạc 70%
                </h3>
                <p>
                  Khi người chơi dừng tại bất động sản chưa có chủ nhưng quyết định bỏ qua không mua, quyền mua sẽ được đưa ra phiên <strong className="text-blue-700 font-semibold">Đấu Giá</strong> công khai cho toàn thể người chơi. Giá khởi điểm bằng <strong className="text-slate-900 font-semibold">50%</strong> giá niêm yết, bước giá đặt nhanh linh hoạt <strong className="text-slate-900 font-semibold">+100, +200, +500 Tr.</strong> VNĐ.
                </p>
                <p className="mt-1 text-slate-600 text-[11px]">
                  Nếu toàn bộ người chơi đều Bỏ Cuộc (Pass), ô đất sẽ được <strong className="text-slate-800 font-semibold">Phát Mãi về Quỹ Kho Bạc với mức giá 70%</strong> để bổ sung nguồn vốn cứu trợ quốc gia.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2 mb-1">
                  <span>🏦</span> Gói Kích Cầu Quỹ Kho Bạc &amp; Siết Tín Dụng BĐS
                </h3>
                <p className="text-emerald-800 mb-1">
                  Khi Quỹ Kho Bạc tích lũy đạt từ <strong className="font-semibold text-emerald-900">10.000 Tr.</strong> trở lên, đầu vòng mới Nhà Nước tự động giải ngân <strong className="font-semibold text-emerald-900">20% quỹ</strong> chia đều cứu trợ người chơi có số dư thấp nhất bàn cờ.
                </p>
                <p className="text-emerald-800 text-[11px]">
                  Ngược lại, khi thẻ <strong className="font-semibold text-emerald-900">Đóng Băng Giao Dịch</strong> kích hoạt, toàn bộ hoạt động mua đất, chuyển nhượng P2P và <strong className="font-semibold text-emerald-900">Thế Chấp mới</strong> bị cấm hoàn toàn trong 2 vòng.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>🏛️</span> Thế Chấp Bất Động Sản &amp; Lãi Vay Vượt GO
                </h3>
                <p>
                  Khi gặp khó khăn tài chính, người chơi có thể <strong className="text-slate-900 font-semibold">Thế Chấp</strong> đất cấp 0 cho Ngân hàng để nhận về khoản vay bằng <strong className="text-slate-900 font-semibold">50%</strong> giá niêm yết. Đất thế chấp không thể thu tiền thuê. Khi chuộc lại, người chơi trả tiền gốc kèm 10% phí giải chấp.
                </p>
                <p className="mt-1 text-slate-600 text-[11px]">
                  Khi đang có dư nợ thế chấp, mỗi lần vượt qua ô Khởi Hành (GO), Ngân hàng sẽ tự động trích thu 5% lãi suất định kỳ (hoặc 10% nếu thị trường đang Siết Tín Dụng).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>⚠️</span> Cơ Chế Phá Sản &amp; Thanh Lý Nợ
                </h3>
                <p>
                  Nếu số dư tiền mặt bị âm và sau khi đã thế chấp toàn bộ tài sản hoặc bán nhà vẫn không đủ thanh toán khoản nợ, người chơi sẽ chính thức <strong className="text-rose-700 font-semibold">Phá Sản</strong>. Toàn bộ tài sản sẽ được chuyển giao cho chủ nợ hoặc hoàn về Ngân sách.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Đã Hiểu
          </button>
        </footer>
      </div>
    </div>
  );
}
