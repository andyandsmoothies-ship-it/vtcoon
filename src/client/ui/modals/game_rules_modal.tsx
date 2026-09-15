// [IMP-72] GameRulesModal — Hướng Dẫn & Thể Lệ Game Toàn Diện (Clean & Modern Style)
import React, { useState } from 'react';

export type GameRulesTab = 'core' | 'cards' | 'mechanics';

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
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 max-h-[85vh] animate-in zoom-in-95 duration-200"
        data-testid="game-rules-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <h2 id="rules-modal-title" className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>📖</span> HƯỚNG DẪN & THỂ LỆ GAME
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            data-testid="close-rules-modal-btn"
            aria-label="Đóng hướng dẫn"
          >
            ✕
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex items-center p-2 gap-1.5 bg-slate-100/70 border-b border-slate-200" aria-label="Danh mục hướng dẫn">
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'core'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            data-testid="rules-tab-core"
          >
            🏆 Quy Tắc Cốt Lõi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'cards'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            data-testid="rules-tab-cards"
          >
            🃏 Danh Mục Thẻ & Ô Cờ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'mechanics'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            data-testid="rules-tab-mechanics"
          >
            ⚖️ Cơ Chế Đặc Biệt
          </button>
        </nav>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-slate-700">
          {activeTab === 'core' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">💰</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Vốn Khởi Điểm & Lương Vòng Đấu</h3>
                  <p>
                    Mỗi người chơi bắt đầu ván đấu với số vốn <strong className="text-blue-700 font-semibold">15.000 Tr.</strong> VNĐ (15 Tỷ). Khi hoàn thành một vòng quanh bàn cờ hoặc dừng tại ô Khởi Hành (GO), nhận thêm mức lương <strong className="text-emerald-700 font-semibold">+2.000 Tr.</strong> VNĐ.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">🎲</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Xúc Xắc & Đổ Đôi</h3>
                  <p>
                    Người chơi tung 2 viên xúc xắc để di chuyển. Nếu tung được <strong className="text-slate-900 font-semibold">xúc xắc đôi</strong> (hai mặt giống nhau), bạn được quyền thực hiện thêm 1 lượt tung tiếp theo. Tuy nhiên, nếu đổ 3 lần xúc xắc đôi liên tiếp, bạn sẽ bị phạt tống giam ngay vào ô Tạm Giam Kiểm Toán.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">⏳</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Thời Lượng Ván Đấu</h3>
                  <p>
                    Cuộc đua tài phiệt kéo dài tối đa <strong className="text-slate-900 font-semibold">30 vòng</strong> thi đấu quanh bàn cờ 40 ô.
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
                      <strong className="text-slate-900 font-semibold">Thắng Điểm Tài Sản:</strong> Sau khi hoàn thành <strong className="text-slate-900 font-semibold">30 vòng</strong>, người chơi có tổng tài sản ròng (tiền mặt + giá trị BĐS + cổ phiếu) cao nhất sẽ giành chiến thắng chung cuộc theo <strong className="text-slate-900 font-semibold">điều kiện thắng</strong>.
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
                  <span>🏘️</span> 28 Bất Động Sản Tỉnh Thành
                </h3>
                <p className="mb-2">
                  Bàn cờ có <strong className="text-slate-900 font-semibold">28</strong> ô bất động sản chia làm 8 <strong className="text-blue-700 font-semibold">nhóm màu</strong> địa lý. Khi sở hữu trọn bộ nhóm màu độc quyền, tiền thuê đất trống tăng gấp đôi.
                </p>
                <div className="flex items-center gap-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                  <span className="font-semibold text-slate-800">Cấp công trình:</span>
                  <span>Đất Trống (C0) ➔ Nhà Cấp 1 (C1) ➔ Nhà Cấp 2 (C2) ➔ Biệt Thự (C3) ➔ <strong className="text-amber-700 font-semibold">khách sạn</strong></span>
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
                  Tiền thuê tăng theo cấp số trạm sở hữu: 1 trạm = 250 Tr. ➔ 2 trạm = 500 Tr. ➔ 3 trạm = 1.000 Tr. ➔ 4 trạm = 2.000 Tr. VNĐ.
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
                  Sở hữu 1 <strong className="text-slate-900 font-semibold">tiện ích</strong>: Điểm xúc xắc × 100 Tr. VNĐ. Sở hữu cả 2 tiện ích: Điểm xúc xắc × 250 Tr. VNĐ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                  <h4 className="font-bold text-sky-900 text-xs flex items-center gap-1.5 mb-1">
                    <span>⚡</span> Phiếu Cơ Hội
                  </h4>
                  <p className="text-[11px] text-sky-800 leading-normal">
                    Rút thẻ <strong className="font-semibold">Cơ Hội</strong> mang lại các cơ hội kinh doanh bất ngờ, thưởng cổ tức hoặc di chuyển thần tốc đến các địa điểm quan trọng.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                  <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 mb-1">
                    <span>📰</span> Phiếu Thị Trường
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    Biến động kinh tế vĩ mô ảnh hưởng toàn bộ người chơi: Bão lũ ven biển, Gói kích cầu tín dụng, hay Thanh tra đất đai.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>📈</span> Sàn Giao Dịch Chứng Khoán HOSE & Lệ Phí
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
                  <span>🚨</span> Trạm Kiểm Toán & Tạm Giam
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

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>🔨</span> Đấu Giá Công Khai (Public Auction)
                </h3>
                <p>
                  Khi người chơi dừng tại bất động sản chưa có chủ nhưng quyết định bỏ qua không mua, quyền mua sẽ được đưa ra phiên <strong className="text-blue-700 font-semibold">Đấu Giá</strong> công khai cho toàn thể người chơi. Giá khởi điểm bằng <strong className="text-slate-900 font-semibold">50%</strong> giá niêm yết, bước giá tối thiểu 50 Tr. VNĐ.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>🏛️</span> Thế Chấp Bất Động Sản
                </h3>
                <p>
                  Khi gặp khó khăn tài chính, người chơi có thể <strong className="text-slate-900 font-semibold">Thế Chấp</strong> đất cấp 0 cho Ngân hàng để nhận về khoản vay bằng <strong className="text-slate-900 font-semibold">50%</strong> giá niêm yết. Đất thế chấp không thể thu tiền thuê. Khi chuộc lại, người chơi trả tiền gốc kèm 10% phí lãi suất.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <span>⚠️</span> Cơ Chế Phá Sản & Thanh Lý Nợ
                </h3>
                <p>
                  Nếu số dư tiền mặt bị âm và sau khi đã thế chấp toàn bộ tài sản hoặc bán nhà vẫn không đủ thanh toán khoản nợ, người chơi sẽ chính thức <strong className="text-rose-700 font-semibold">Phá Sản</strong>. Toàn bộ tài sản sẽ được chuyển giao cho chủ nợ hoặc hoàn về Ngân sách.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Đã Hiểu
          </button>
        </footer>
      </div>
    </div>
  );
}
