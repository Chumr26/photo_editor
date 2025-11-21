import { X } from 'lucide-react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    { key: 'Ctrl/Cmd + Z', action: 'Hoàn tác (Undo)' },
    { key: 'Ctrl/Cmd + Shift + Z', action: 'Làm lại (Redo)' },
    { key: 'Ctrl/Cmd + +', action: 'Phóng to (Zoom In)' },
    { key: 'Ctrl/Cmd + -', action: 'Thu nhỏ (Zoom Out)' },
    { key: 'Ctrl/Cmd + Wheel', action: 'Phóng to/Thu nhỏ (Zoom In/Out)' },
    { key: 'Ctrl/Cmd + 0', action: 'Vừa màn hình (Fit to Screen)' },
    { key: 'Ctrl/Cmd + 1', action: 'Kích thước thực (Actual Size)' },
    { key: 'Space + Drag', action: 'Di chuyển canvas (Pan)' },
    { key: 'V', action: 'Công cụ di chuyển (Move Tool)' },
    { key: 'C', action: 'Công cụ cắt (Crop Tool)' },
    { key: 'T', action: 'Công cụ chữ (Text Tool)' },
    { key: 'I', action: 'Chèn ảnh (Insert Image)' },
    { key: 'B', action: 'Cọ vẽ (Brush Tool)' },
    { key: 'L', action: 'Bật/tắt Lớp (Toggle Layers)' },
    { key: 'H', action: 'Bật/tắt Lịch sử (Toggle History)' },
    { key: 'G', action: 'Bật/tắt Lưới (Toggle Grid)' },
    { key: 'R', action: 'Bật/tắt Thước (Toggle Rulers)' },
    { key: 'P', action: 'Bật/tắt Bộ lọc (Toggle Presets)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#2a2a2a] border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-gray-200">
            Phím tắt (Keyboard Shortcuts)
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800 rounded"
              >
                <span className="text-sm text-gray-300">{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-gray-900 text-gray-200 rounded text-xs border border-gray-700">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded">
            <p className="text-sm text-blue-200">
              💡 Mẹo: Sử dụng phím tắt để chỉnh sửa nhanh hơn. Bạn có thể tùy chỉnh phím tắt trong Cài đặt.
            </p>
            <p className="text-sm text-blue-300/70 mt-1">
              💡 Tip: Use keyboard shortcuts for faster editing. You can customize shortcuts in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}